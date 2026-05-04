import math
from collections import Counter


def shannon_entropy(value: str) -> float:
    if not value:
        return 0.0
    length = len(value)
    counts = Counter(value)
    return -sum((count / length) * math.log2(count / length) for count in counts.values())
