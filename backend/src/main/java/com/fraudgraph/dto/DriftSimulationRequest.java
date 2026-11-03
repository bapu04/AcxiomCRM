package com.fraudgraph.dto;

public class DriftSimulationRequest {
    private String scenario = "NORMAL_STREAM"; // NORMAL_STREAM, MULE_ATTACK, VELOCITY_BURST, HIGH_AMOUNT_DRIFT, RAPID_LAYERING
    private int count = 10;
    private double driftIntensity = 0.5;

    public DriftSimulationRequest() {}

    public DriftSimulationRequest(String scenario, int count, double driftIntensity) {
        this.scenario = scenario;
        this.count = count;
        this.driftIntensity = driftIntensity;
    }

    public String getScenario() { return scenario; }
    public void setScenario(String scenario) { this.scenario = scenario; }

    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }

    public double getDriftIntensity() { return driftIntensity; }
    public void setDriftIntensity(double driftIntensity) { this.driftIntensity = driftIntensity; }
}
