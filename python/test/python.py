
class Calculator:
    vector = []

    def __init__(self, vector):
        self.vector = vector

    def multiply(self, scalar, vector):
        return [scalar * x for x in vector]
    
    def add(self, vector1, vector2):
        return [x + y for x, y in zip(vector1, vector2)]
    
    def subtract(self, vector1, vector2):
        return [x - y for x, y in zip(vector1, vector2)]

def hello():
    print("Hello World")

def sum(a, b):
    return a + b