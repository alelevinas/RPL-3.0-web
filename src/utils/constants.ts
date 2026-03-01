export const testCodeC = `#include <criterion/criterion.h>  // No borrar esto!
#include "api.h"  // Modificar con el nombre de la api que se le entrega al alumno!

Test(misc, testName1) {
    cr_assert(fooNothing() == 0);
}

Test(misc, testName2) {
    cr_assert(fooNothing() == 0);
}`;

export const testCodePython = `import unittest
from solution import *

class TestMethods(unittest.TestCase):
    def test_1(self):
        self.assertEqual(1, 1)

    def test_2(self):
        self.assertEqual(2, 2)`;

export const testCodeGo = `package main

import (
    "testing"
    "github.com/stretchr/testify/assert"
)

func TestSomething(t *testing.T) {
    assert.Equal(t, 1, 1)
}`;

export const testCodeRust = `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_something() {
        assert_eq!(1, 1);
    }
}`;

export const testCodeJava = `import org.junit.Test;
import static org.junit.Assert.*;

public class SolutionTest {
    @Test
    public void testSomething() {
        assertEquals(1, 1);
    }
}`;

export const languageOptions = [
  { value: "c_std11", label: "C (std11)" },
  { value: "python_3.10", label: "Python 3.10" },
  { value: "go_1.19", label: "Go 1.19" },
  { value: "rust_1.88.0", label: "Rust" },
  { value: "java_17", label: "Java 17" },
];

export const getTestCodeForLanguage = (lang: string): string => {
  if (lang.startsWith("c_")) return testCodeC;
  if (lang.startsWith("python")) return testCodePython;
  if (lang.startsWith("go")) return testCodeGo;
  if (lang.startsWith("rust")) return testCodeRust;
  if (lang.startsWith("java")) return testCodeJava;
  return testCodeC;
};

export const getMonacoLanguage = (lang: string): string => {
  if (lang.startsWith("c_")) return "c";
  if (lang.startsWith("python")) return "python";
  if (lang.startsWith("go")) return "go";
  if (lang.startsWith("rust")) return "rust";
  if (lang.startsWith("java")) return "java";
  return "c";
};

export const getFileExtension = (lang: string): string => {
  if (lang.startsWith("c_")) return ".c";
  if (lang.startsWith("python")) return ".py";
  if (lang.startsWith("go")) return ".go";
  if (lang.startsWith("rust")) return ".rs";
  if (lang.startsWith("java")) return ".java";
  return ".c";
};
