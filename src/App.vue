<script lang="ts" setup>
import { ref, computed } from "vue";

const value = ref(1);
const unit = ref("%");
const inputValue = ref("1");
const isFocused = ref(false);
const isHovering = ref(false);
const isShowTooltip = ref(false);
const tooltipMessage = ref("");
const tooltipTimeout = ref<any>(0);
const tooltipPosition = ref("center"); // left, center, right
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
	// Replace comma with period
	let sanitized = input.replace(",", ".");

	// Remove all non-numeric characters except one period and negative
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

function handleBlur() {
	isFocused.value = false;

	// If input is empty or less than 0, reset to 0
	if (!inputValue.value || parseFloat(inputValue.value) < 0) {
		inputValue.value = "0";
		value.value = 0;
		showTooltip("Value must greater than 0");
		tooltipPosition.value = "left";
		return;
	}

	const sanitized = sanitizeInput(inputValue.value);
	const parsedValue = parseFloat(sanitized);

	// Validation for percentage values
	if (unit.value === "%") {
		if (parsedValue > 100) {
			value.value = previousValidValue.value;
			inputValue.value = previousValidValue.value.toString();
			showTooltip("Value must smaller than 100");
			tooltipPosition.value = "right";
		} else {
			value.value = parsedValue;
			inputValue.value = sanitized;
		}
	} else {
		value.value = parsedValue;
		inputValue.value = sanitized;
	}
}

function handleChange() {
	const parsedValue = parseFloat(inputValue.value);
	value.value = parsedValue;
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

	// If switching from px to % and value > 100, update to 100
	if (newUnit === "%" && value.value > 100) {
		value.value = 100;
		inputValue.value = "100";
	}

	unit.value = newUnit;
}

// Show tooltip
function showTooltip(message: string) {
	clearTimeout(tooltipTimeout.value);
	tooltipMessage.value = message;
	isShowTooltip.value = true;

	tooltipTimeout.value = setTimeout(() => {
		isShowTooltip.value = false;
	}, 5000);
}
</script>

<template>
  <div
    className="w-screen h-screen bg-neutral-950 flex items-center justify-center text-neutral-100"
  >
    <div className="w-96 bg-neutral-800 p-4 rounded-lg">
      Your component go here
      <div class="bg-[#151515] p-4 rounded-lg w-[280px] h-[120px] m-auto">
        <div class="mb-4 flex justify-between items-center">
          <div class="text-[#AAAAAA]">Unit</div>
          <div class="flex w-[140px] h-[36px]">
            <button
              @click="switchUnit('%')"
              class="px-4 h-full w-50 rounded-l-lg flex justify-center items-center"
              :class="
                unit === '%'
                  ? 'bg-[#424242] text-[#F9F9F9]'
                  : 'bg-[#212121] text-[#AAAAAA]'
              "
            >
              %
            </button>
            <button
              @click="switchUnit('px')"
              class="px-4 h-full w-50 rounded-r-lg flex justify-center items-center"
              :class="
                unit === 'px'
                  ? 'bg-[#424242] text-[#F9F9F9]'
                  : 'bg-[#212121] text-[#AAAAAA]'
              "
            >
              px
            </button>
          </div>
        </div>

        <div class="flex justify-between items-center">
          <div class="text-[#AAAAAA]">Value</div>
          <div
            class="relative flex items-center rounded-lg w-[140px] h-[36px]"
            :class="[
              isHovering ? 'bg-[#424242]' : 'bg-[#212121]',
              isFocused ? 'shadow-[0_0_0_1px_#3C67FF] rounded-lg' : '',
            ]"
          >
            <button
              @click="decrementValue"
              class="px-3 h-full w-[36px] z-1 rounded-l-lg flex justify-center items-center"
              :disabled="shouldDisableDecrement"
              :class="
                shouldDisableDecrement
                  ? 'text-[#3B3B3B] cursor-not-allowed'
                  : 'text-[#F9F9F9] hover:bg-[#424242]'
              "
            >
              <span class="text-xl mb-1">−</span>
            </button>
            <input
              id="input-value"
              v-model="inputValue"
              @blur="handleBlur"
              @focus="handleFocus"
              @mouseenter="isHovering = true"
              @mouseleave="isHovering = false"
              @keyup="handleChange"
              type="text"
              class="text-[#F9F9F9] text-center w-full outline-none z-1"
              :class="[isHovering ? 'bg-[#424242]' : 'bg-[#212121]']"
            />
            <button
              @click="incrementValue"
              class="px-3 h-full w-[36px] z-1 rounded-r-lg flex justify-center items-center"
              :disabled="shouldDisableIncrement"
              :class="
                shouldDisableIncrement
                  ? 'text-[#3B3B3B] cursor-not-allowed'
                  : 'text-[#F9F9F9] hover:bg-[#424242]'
              "
            >
              <span class="text-xl mb-1">+</span>
            </button>

            <!-- Tooltip -->
            <div
              class="absolute w-fit top-0 opacity-0 transition-all ease-in-out duration-200 whitespace-nowrap z-0 mt-2 bg-[#212121] text-[#F9F9F9] text-sm px-3 py-1 rounded-lg"
              :class="[
                isShowTooltip ? 'opacity-100 top-[calc(-100%-8px)]' : 'opacity-0 top-0',
                tooltipPosition === 'left'
                  ? 'left-[-55%]'
                  : 'right-[-55%]',
              ]"
            >
              {{ tooltipMessage }}
              <div class="absolute bottom-[-6px] left-1/2 h-[7px] w-[7px] rotate-45 bg-[#212121] -translate-x-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
