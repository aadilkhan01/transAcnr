export interface PredictionTarget {
  probability: number;
  threshold: number;
  triggered: boolean;
  anomaly_score: number;
  model_probs: Record<string, number>;
  risk_level: "NORMAL" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  recommendation: string;
}

export interface Prediction {
  _id: string;
  run_id: string;
  inference_timestamp: string;
  source: string;
  num_samples: number;
  predictions: {
    compressor_failure: PredictionTarget;
    pump_failure: PredictionTarget;
    cooling_degradation: PredictionTarget;
  };
  summary: {
    overall_risk_level: "NORMAL" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    targets_triggered: string[];
    active_recommendations: string[];
  };
  drift_report: {
    drift_detected: boolean;
    reason: string;
    features: Record<string, unknown>;
  };
  saved_at: { $date: string } | string;
}

export interface AppNotification {
  _id: string;
  run_id: string;
  target: string;
  risk_level: string;
  message: string;
  created_at: string;
  dismissed: boolean;
}

export interface Acknowledgment {
  _id: string;
  run_id: string;
  target: string;
  acknowledged_at: string;
  notes?: string;
}
