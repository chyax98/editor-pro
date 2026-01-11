import { evaluateArithmeticExpression } from "../src/features/editing/inline-calc";

describe("Inline calc", () => {
	test("evaluates basic arithmetic", () => {
		expect(evaluateArithmeticExpression("1+2*3")).toBe(7);
		expect(evaluateArithmeticExpression("(1+2)*3")).toBe(9);
		expect(evaluateArithmeticExpression("2^3")).toBe(8);
	});

	test("supports unary minus", () => {
		expect(evaluateArithmeticExpression("-1")).toBe(-1);
		expect(evaluateArithmeticExpression("2*-3")).toBe(-6);
		expect(evaluateArithmeticExpression("-(3)")).toBeNull(); // unary minus only before number (intentional)
	});

	test("rejects invalid input", () => {
		expect(evaluateArithmeticExpression("abc")).toBeNull();
		expect(evaluateArithmeticExpression("1+")).toBeNull();
		expect(evaluateArithmeticExpression("()")).toBeNull();
	});
});

