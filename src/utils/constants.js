const testCodeC = `#include <criterion/criterion.h>  // No borrar esto!
#include "api.h"  // Modificar con el nombre de la api que se le entrega al alumno!

Test(misc, testName1) {
    cr_assert(fooNoRepetido() == 1);
}

Test(misc, testName2) {
    cr_assert(barNoRepetido() == 2);
}`;

const testCodePython = `import unittest  # No borrar esto!
import timeout_decorator
import assignment_main # Modificar con el nombre de la api que se le entrega al alumno!

# Accede a las funciones del alumno desde el modulo assignment_main


class TestMethods(unittest.TestCase):

  @timeout_decorator.timeout(5)  # segundos
  def test_1(self):
    self.assertTrue(assignment_main.hola_mundo())

  def test_2(self):
    self.assertTrue(assignment_main.hola_mundo())`;

const testCodeGo = `package main
import (
	"testing"
	"github.com/stretchr/testify/assert"
)`;

const testCodeRust = `use student_package::*; // No borrar!

// IMPORTANTE: 
// los assert reportan fallas de la forma assertion left == right failed
// Nunca se muestran los nombres de las funciones/variables que tengan. 
// Es altamente recomendable que se usen mensajes descriptivos en los mismos para que el alumno pueda identificar la falla. 
// Los mensajes de los assert solo se mostraran si la aserción falla.
// Este es un archivo de ejemplo.

#[test]
fn foo_no_repetido_devuelve_resultado_esperado() {
    let obtained = foo_no_repetido();
    let expected = 1;
    assert_eq!(
        obtained, expected,
        "El resultado de foo_no_repetido() no es igual a 1"
    );
}

#[test]
fn bar_no_repetido_devuelve_resultado_esperado() {
    let obtained = bar_no_repetido();
    let expected = 2;
    let msg = format!("El resultado obtenido ({}) no es igual a {}", obtained, expected);
    assert_eq!(
        obtained, expected, "{}", msg
    );
    assert_ne!(
        obtained, 3,
        "El resultado de bar_no_repetido() no debe ser igual a 3"
    );
    assert!(
        obtained > 0,
        "El resultado de bar_no_repetido() debe ser mayor a 0"
    );
}
`;

module.exports = {
  languages: {
    c: {
      main: "main.c",
      comment: "//",
      extension: ".c",
      testCode: testCodeC,
      testDocs: "https://criterion.readthedocs.io/en/master/assert.html",
    },
    python: {
      main: "assignment_main.py",
      comment: "#",
      extension: ".py",
      testCode: testCodePython,
      testDocs: "https://docs.python.org/3/library/unittest.html#assert-methods",
    },
    go: {
      main: "main.go",
      comment: "//",
      extension: ".go",
      testCode: testCodeGo,
      testDocs: "https://github.com/stretchr/testify",
    },
    rust: {
      main: "main.rs",
      comment: "//",
      extension: ".rs",
      testCode: testCodeRust,
      testDocs: "https://doc.rust-lang.org/book/ch11-01-writing-tests.html",
    }
  },
};
