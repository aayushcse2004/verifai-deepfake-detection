from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List


class BaseForensicAdapter(ABC):
    """
    Standardized abstract base class for all forensic detection modules.
    Ensures modularity, uniform error containment, and transparent operational state reporting.
    """
    def __init__(self, name: str, version: str):
        self.name = name
        self.version = version

    @abstractmethod
    def is_available(self) -> bool:
        """Returns True if the underlying model weights and dependencies are available."""
        pass

    @abstractmethod
    def get_operational_mode(self) -> str:
        """
        Returns one of:
        - 'active_model': Real neural network / pretrained checkpoint running.
        - 'baseline_heuristic': Computer vision / signal processing baseline algorithm.
        - 'mock_adapter': Synthetic testing harness.
        - 'unavailable': Hardware or dependency missing.
        """
        pass

    @abstractmethod
    def analyze(self, **kwargs) -> Dict[str, Any]:
        """
        Executes analysis and returns standardized result dictionary:
        {
            'score': Optional[float],     # 0.0 (genuine) to 1.0 (manipulated), or None if skipped/unavailable
            'confidence': float,          # 0.0 to 1.0 confidence in model prediction
            'status': str,                # 'COMPLETED', 'UNAVAILABLE', 'FAILED'
            'details': str,               # Human-readable summary of findings
            'evidence': List[Dict],       # Timestamped forensic anomalies detected
            'metrics': Dict[str, Any],    # Raw component numbers
        }
        """
        pass

