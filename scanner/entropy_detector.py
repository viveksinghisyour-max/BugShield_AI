import math
from collections import Counter


def shannon_entropy(data):

    if not data:
        return 0

    entropy = 0
    length = len(data)

    counter = Counter(data)

    for count in counter.values():

        probability = count / length
        entropy -= probability * math.log2(probability)

    return entropy