package com.fraudgraph.engine;

import com.fraudgraph.dto.GraphVisualizationDTO;
import com.fraudgraph.model.Account;
import com.fraudgraph.model.Transaction;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class GraphAnalyticsEngine {

    public static class GraphEdge {
        private final String source;
        private final String target;
        private final Transaction transaction;

        public GraphEdge(String source, String target, Transaction transaction) {
            this.source = source;
            this.target = target;
            this.transaction = transaction;
        }

        public String getSource() { return source; }
        public String getTarget() { return target; }
        public Transaction getTransaction() { return transaction; }
    }

    // In-memory sliding window directed graph: sender -> list of edges
    private final Map<String, List<GraphEdge>> adjacencyList = new ConcurrentHashMap<>();
    private final Map<String, List<GraphEdge>> reverseAdjacencyList = new ConcurrentHashMap<>();
    private final List<Transaction> recentTransactions = new CopyOnWriteArrayList<>();
    private final int MAX_RECENT_TXNS = 1000;

    public synchronized void recordTransaction(Transaction txn) {
        recentTransactions.add(txn);
        if (recentTransactions.size() > MAX_RECENT_TXNS) {
            recentTransactions.remove(0);
        }

        adjacencyList.computeIfAbsent(txn.getSenderAccount(), k -> new CopyOnWriteArrayList<>())
                .add(new GraphEdge(txn.getSenderAccount(), txn.getRecipientAccount(), txn));

        reverseAdjacencyList.computeIfAbsent(txn.getRecipientAccount(), k -> new CopyOnWriteArrayList<>())
                .add(new GraphEdge(txn.getSenderAccount(), txn.getRecipientAccount(), txn));
    }

    /**
     * Detects if the given transaction participates in a circular transaction loop (e.g. A -> B -> C -> A)
     * using depth-bounded DFS. Circular routing is a primary indicator of money laundering layering.
     */
    public boolean detectsCircularLoop(String sender, String recipient, int maxDepth) {
        if (sender.equalsIgnoreCase(recipient)) {
            return true; // Direct self-loop
        }

        Set<String> visited = new HashSet<>();
        List<String> path = new ArrayList<>();
        path.add(recipient);
        visited.add(recipient);

        return dfsFindPath(recipient, sender, visited, path, 1, maxDepth);
    }

    private boolean dfsFindPath(String current, String target, Set<String> visited, List<String> path, int depth, int maxDepth) {
        if (depth > maxDepth) return false;

        List<GraphEdge> edges = adjacencyList.get(current);
        if (edges == null || edges.isEmpty()) return false;

        for (GraphEdge edge : edges) {
            String nextNode = edge.getTarget();
            if (nextNode.equalsIgnoreCase(target)) {
                return true;
            }
            if (!visited.contains(nextNode)) {
                visited.add(nextNode);
                path.add(nextNode);
                if (dfsFindPath(nextNode, target, visited, path, depth + 1, maxDepth)) {
                    return true;
                }
                visited.remove(nextNode);
                path.remove(path.size() - 1);
            }
        }
        return false;
    }

    /**
     * Checks if the recipient acts as a rapid accumulator mule (Fan-In):
     * e.g., 3 or more distinct senders depositing funds into this account recently.
     */
    public boolean isMuleAccumulatorFanIn(String recipientAccount, int thresholdDistinctSenders) {
        List<GraphEdge> incoming = reverseAdjacencyList.get(recipientAccount);
        if (incoming == null || incoming.size() < thresholdDistinctSenders) return false;

        Set<String> distinctSenders = new HashSet<>();
        for (GraphEdge edge : incoming) {
            distinctSenders.add(edge.getSource());
        }
        return distinctSenders.size() >= thresholdDistinctSenders;
    }

    /**
     * Checks if the sender acts as a rapid disperser mule (Fan-Out):
     * e.g., sending out funds to 3 or more distinct destinations rapidly.
     */
    public boolean isMuleDisperserFanOut(String senderAccount, int thresholdDistinctRecipients) {
        List<GraphEdge> outgoing = adjacencyList.get(senderAccount);
        if (outgoing == null || outgoing.size() < thresholdDistinctRecipients) return false;

        Set<String> distinctRecipients = new HashSet<>();
        for (GraphEdge edge : outgoing) {
            distinctRecipients.add(edge.getTarget());
        }
        return distinctRecipients.size() >= thresholdDistinctRecipients;
    }

    /**
     * Builds visualization payload containing nodes, edges, detected cycles, and mule accounts.
     */
    public GraphVisualizationDTO buildGraphTopology(Map<String, Account> accountsLookup) {
        GraphVisualizationDTO dto = new GraphVisualizationDTO();
        Map<String, GraphVisualizationDTO.NodeDTO> nodeMap = new HashMap<>();
        List<GraphVisualizationDTO.EdgeDTO> edgeList = new ArrayList<>();
        List<List<String>> detectedCycles = new ArrayList<>();
        Set<String> flaggedMules = new HashSet<>();

        // Take last 50 transactions to render an informative, uncluttered topology
        int start = Math.max(0, recentTransactions.size() - 50);
        List<Transaction> slice = recentTransactions.subList(start, recentTransactions.size());

        for (Transaction t : slice) {
            String u = t.getSenderAccount();
            String v = t.getRecipientAccount();

            nodeMap.putIfAbsent(u, createNodeDTO(u, accountsLookup.get(u)));
            nodeMap.putIfAbsent(v, createNodeDTO(v, accountsLookup.get(v)));

            // Update in/out degrees
            nodeMap.get(u).setOutDegree(nodeMap.get(u).getOutDegree() + 1);
            nodeMap.get(v).setInDegree(nodeMap.get(v).getInDegree() + 1);

            boolean inCycle = detectsCircularLoop(u, v, 4);
            if (inCycle) {
                detectedCycles.add(Arrays.asList(u, v, "...loop"));
                nodeMap.get(u).setFlagged(true);
                nodeMap.get(v).setFlagged(true);
            }

            if (isMuleAccumulatorFanIn(v, 3)) {
                flaggedMules.add(v);
                nodeMap.get(v).setMuleCandidate(true);
            }
            if (isMuleDisperserFanOut(u, 3)) {
                flaggedMules.add(u);
                nodeMap.get(u).setMuleCandidate(true);
            }

            edgeList.add(new GraphVisualizationDTO.EdgeDTO(
                    u, v, t.getAmount(), t.getTxnReference(), inCycle, t.getRiskScore(), t.getTimestamp().toString()
            ));
        }

        dto.setNodes(new ArrayList<>(nodeMap.values()));
        dto.setEdges(edgeList);
        dto.setDetectedCycles(detectedCycles);
        dto.setFlaggedMuleAccounts(new ArrayList<>(flaggedMules));
        return dto;
    }

    private GraphVisualizationDTO.NodeDTO createNodeDTO(String accountNum, Account account) {
        String riskTier = account != null ? account.getRiskTier() : "MEDIUM";
        String status = account != null ? account.getStatus() : "ACTIVE";
        String label = account != null ? account.getHolderName() : accountNum;
        return new GraphVisualizationDTO.NodeDTO(accountNum, label, riskTier, status, 0, 0, false, false);
    }

    public synchronized void resetGraph() {
        adjacencyList.clear();
        reverseAdjacencyList.clear();
        recentTransactions.clear();
    }
}
