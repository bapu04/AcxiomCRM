package com.fraudgraph.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class GraphVisualizationDTO {

    public static class NodeDTO {
        private String id;
        private String label;
        private String riskTier;
        private String status;
        private int inDegree;
        private int outDegree;
        private boolean isMuleCandidate;
        private boolean isFlagged;

        public NodeDTO() {}

        public NodeDTO(String id, String label, String riskTier, String status, int inDegree, int outDegree, boolean isMuleCandidate, boolean isFlagged) {
            this.id = id;
            this.label = label;
            this.riskTier = riskTier;
            this.status = status;
            this.inDegree = inDegree;
            this.outDegree = outDegree;
            this.isMuleCandidate = isMuleCandidate;
            this.isFlagged = isFlagged;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public String getRiskTier() { return riskTier; }
        public void setRiskTier(String riskTier) { this.riskTier = riskTier; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public int getInDegree() { return inDegree; }
        public void setInDegree(int inDegree) { this.inDegree = inDegree; }

        public int getOutDegree() { return outDegree; }
        public void setOutDegree(int outDegree) { this.outDegree = outDegree; }

        public boolean isMuleCandidate() { return isMuleCandidate; }
        public void setMuleCandidate(boolean muleCandidate) { isMuleCandidate = muleCandidate; }

        public boolean isFlagged() { return isFlagged; }
        public void setFlagged(boolean flagged) { isFlagged = flagged; }
    }

    public static class EdgeDTO {
        private String source;
        private String target;
        private BigDecimal amount;
        private String txnReference;
        private boolean isInCycle;
        private int riskScore;
        private String timestamp;

        public EdgeDTO() {}

        public EdgeDTO(String source, String target, BigDecimal amount, String txnReference, boolean isInCycle, int riskScore, String timestamp) {
            this.source = source;
            this.target = target;
            this.amount = amount;
            this.txnReference = txnReference;
            this.isInCycle = isInCycle;
            this.riskScore = riskScore;
            this.timestamp = timestamp;
        }

        public String getSource() { return source; }
        public void setSource(String source) { this.source = source; }

        public String getTarget() { return target; }
        public void setTarget(String target) { this.target = target; }

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }

        public String getTxnReference() { return txnReference; }
        public void setTxnReference(String txnReference) { this.txnReference = txnReference; }

        public boolean isInCycle() { return isInCycle; }
        public void setInCycle(boolean inCycle) { isInCycle = inCycle; }

        public int getRiskScore() { return riskScore; }
        public void setRiskScore(int riskScore) { this.riskScore = riskScore; }

        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    }

    private List<NodeDTO> nodes = new ArrayList<>();
    private List<EdgeDTO> edges = new ArrayList<>();
    private List<List<String>> detectedCycles = new ArrayList<>();
    private List<String> flaggedMuleAccounts = new ArrayList<>();

    public GraphVisualizationDTO() {}

    public List<NodeDTO> getNodes() { return nodes; }
    public void setNodes(List<NodeDTO> nodes) { this.nodes = nodes; }

    public List<EdgeDTO> getEdges() { return edges; }
    public void setEdges(List<EdgeDTO> edges) { this.edges = edges; }

    public List<List<String>> getDetectedCycles() { return detectedCycles; }
    public void setDetectedCycles(List<List<String>> detectedCycles) { this.detectedCycles = detectedCycles; }

    public List<String> getFlaggedMuleAccounts() { return flaggedMuleAccounts; }
    public void setFlaggedMuleAccounts(List<String> flaggedMuleAccounts) { this.flaggedMuleAccounts = flaggedMuleAccounts; }
}
