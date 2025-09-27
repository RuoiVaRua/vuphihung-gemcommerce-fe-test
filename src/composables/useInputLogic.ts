import { ref, computed, watch } from "vue";

export function useInputLogic() {
  const value = ref(1);
  const unit = ref("%");
  const inputValue = ref("1");
  const isFocused = ref(false);
  const isHovering = ref(false);
  const previousValidValue = ref(1);

  // Validation and button disabling logic
  const shouldDisableDecrement = computed(() => {
    return value.value <= 0;
  });

  const shouldDisableIncrement = computed(() => {
    return unit.value === "%" && value.value >= 100;
  });

  // Helper functions for validation
  function sanitizeInput(input: string): string {
    let sanitized = input.replace(",", ".");
    let hasPeriod = false;
    let hasNegative = false;
    let result = "";

    for (let i = 0; i < sanitized.length; i++) {
      const char = sanitized[i];
      if (char === "." && !hasPeriod) {
        hasPeriod = true;
        result += char;
      } else if (char === "-" && !hasNegative) {
        hasNegative = true;
        result += char;
      } else if (/[0-9]/.test(char)) {
        result += char;
      }
    }
    return result;
  }

  // Event handlers
  function handleFocus() {
    isFocused.value = true;
    previousValidValue.value = value.value;
  }

  function handleBlur(showTooltip: (message: string) => void, setTooltipPosition: (position: string) => void) {
    isFocused.value = false;

    const sanitized = sanitizeInput(inputValue.value);
    const parsedValue = parseFloat(sanitized);

    // Strategy Pattern for validation
    const validationStrategies: {
      condition: (val: number, u: string, sanitizedInput: string) => boolean;
      message?: string; // Make message optional
      position?: string; // Make position optional
      action?: (val: number) => void;
    }[] = [
      {
        condition: (val, _u, sanitizedInput) => val === 0 && !!sanitizedInput.replace(/^-/, '').match(/^0*$/),
        // Không có message và position để không hiển thị tooltip
        action: () => {
          inputValue.value = "0";
          value.value = 0;
        },
      },
      {
        condition: (val, _u, _sanitizedInput) => !inputValue.value || !sanitized || isNaN(val),
        message: "Value must be a floating or natural number",
        position: "center",
        action: () => {
          inputValue.value = "0";
          value.value = 0;
        },
      },
      {
        condition: (val, _u) => val < 0,
        message: "Value must greater than 0",
        position: "left",
        action: () => {
          inputValue.value = "0";
          value.value = 0;
        },
      },
      {
        condition: (val, u) => u === "%" && val > 100,
        message: "Value must smaller than 100",
        position: "right",
        action: (_val) => {
          value.value = previousValidValue.value;
          inputValue.value = previousValidValue.value.toString();
        },
      },
    ];

    for (const strategy of validationStrategies) {
      if (strategy.condition(parsedValue, unit.value, sanitized)) {
        if (strategy.action) {
          strategy.action(parsedValue);
        }
        if (strategy.message && strategy.position) { // Only show tooltip if message and position are defined
          showTooltip(strategy.message);
          setTooltipPosition(strategy.position);
        }
        return;
      }
    }

    // If all validations pass
    value.value = parsedValue;
    inputValue.value = sanitized;
  }

  function handleChange() {
    // Only update value if input is a valid number, otherwise keep previous valid value
    const sanitized = sanitizeInput(inputValue.value);
    const parsedValue = parseFloat(sanitized);
    if (!isNaN(parsedValue)) {
      value.value = parsedValue;
    }
    inputValue.value = inputValue.value.replace(",", ".");
  }

  function incrementValue() {
    if (unit.value === "%" && value.value >= 100) return;
    value.value += 1;
    inputValue.value = value.value.toString();
  }

  function decrementValue() {
    if (value.value <= 0) return;
    value.value -= 1;
    inputValue.value = value.value.toString();
  }

  function switchUnit(newUnit: string) {
    if (unit.value === newUnit) return;

    if (newUnit === "%" && value.value > 100) {
      value.value = 100;
      inputValue.value = "100";
    }
    unit.value = newUnit;
  }

  // Watch for unit changes to re-validate if needed
  watch(unit, (newUnit, _oldUnit) => {
    if (newUnit === "%" && value.value > 100) {
      value.value = 100;
      inputValue.value = "100";
    }
  });

  return {
    value,
    unit,
    inputValue,
    isFocused,
    isHovering,
    shouldDisableDecrement,
    shouldDisableIncrement,
    handleFocus,
    handleBlur,
    handleChange,
    incrementValue,
    decrementValue,
    switchUnit,
  };
}
