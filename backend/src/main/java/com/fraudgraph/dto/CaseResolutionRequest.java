package com.fraudgraph.dto;

import com.fraudgraph.model.AlertStatus;
import jakarta.validation.constraints.NotNull;

public class CaseResolutionRequest {

    @NotNull
    private AlertStatus status;

    private String investigatorNotes;

    public CaseResolutionRequest() {}

    public AlertStatus getStatus() { return status; }
    public void setStatus(AlertStatus status) { this.status = status; }

    public String getInvestigatorNotes() { return investigatorNotes; }
    public void setInvestigatorNotes(String investigatorNotes) { this.investigatorNotes = investigatorNotes; }
}
