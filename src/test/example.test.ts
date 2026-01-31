import { describe, it, expect, vi, beforeEach } from "vitest";

// Example tests to ensure test infrastructure works

describe("Example Tests", () => {
  describe("Basic Assertions", () => {
    it("should pass basic equality checks", () => {
      expect(1 + 1).toBe(2);
      expect("hello").toBe("hello");
      expect(true).toBe(true);
    });

    it("should work with arrays and objects", () => {
      expect([1, 2, 3]).toEqual([1, 2, 3]);
      expect({ name: "test" }).toEqual({ name: "test" });
    });

    it("should handle async operations", async () => {
      const asyncFn = () => Promise.resolve("result");
      const result = await asyncFn();
      expect(result).toBe("result");
    });
  });

  describe("Mocking", () => {
    it("should create and use mocks", () => {
      const mockFn = vi.fn();
      mockFn("arg1", "arg2");
      
      expect(mockFn).toHaveBeenCalled();
      expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should mock return values", () => {
      const mockFn = vi.fn().mockReturnValue("mocked");
      expect(mockFn()).toBe("mocked");
    });

    it("should mock async return values", async () => {
      const mockFn = vi.fn().mockResolvedValue("async mocked");
      expect(await mockFn()).toBe("async mocked");
    });
  });

  describe("Error Handling", () => {
    it("should catch thrown errors", () => {
      const throwError = () => {
        throw new Error("Test error");
      };
      
      expect(throwError).toThrow("Test error");
    });

    it("should handle rejected promises", async () => {
      const rejectFn = () => Promise.reject(new Error("Async error"));
      await expect(rejectFn()).rejects.toThrow("Async error");
    });
  });
});

describe("Business Logic Patterns", () => {
  describe("Data Transformation", () => {
    it("should transform user data correctly", () => {
      const rawUser = { first_name: "John", last_name: "Doe", age: 30 };
      const formatUser = (user: typeof rawUser) => ({
        fullName: `${user.first_name} ${user.last_name}`,
        isAdult: user.age >= 18,
      });
      
      const result = formatUser(rawUser);
      expect(result.fullName).toBe("John Doe");
      expect(result.isAdult).toBe(true);
    });

    it("should filter data by criteria", () => {
      const items = [
        { id: 1, status: "active" },
        { id: 2, status: "inactive" },
        { id: 3, status: "active" },
      ];
      
      const activeItems = items.filter(i => i.status === "active");
      expect(activeItems).toHaveLength(2);
      expect(activeItems.map(i => i.id)).toEqual([1, 3]);
    });
  });

  describe("State Management Patterns", () => {
    it("should correctly merge state updates", () => {
      const initialState = { count: 0, name: "test", active: false };
      const update = { count: 5, active: true };
      
      const newState = { ...initialState, ...update };
      
      expect(newState.count).toBe(5);
      expect(newState.name).toBe("test");
      expect(newState.active).toBe(true);
    });

    it("should handle array state updates immutably", () => {
      const items = [{ id: 1, value: "a" }, { id: 2, value: "b" }];
      const updateItem = (arr: typeof items, id: number, value: string) =>
        arr.map(item => item.id === id ? { ...item, value } : item);
      
      const updated = updateItem(items, 1, "updated");
      expect(updated[0].value).toBe("updated");
      expect(updated[1].value).toBe("b");
      // Original should be unchanged
      expect(items[0].value).toBe("a");
    });
  });
});
