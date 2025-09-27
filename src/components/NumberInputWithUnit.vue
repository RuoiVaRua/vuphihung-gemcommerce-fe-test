<script lang="ts" setup>
import { computed } from "vue";
import { useInputLogic } from "../composables/useInputLogic";
import { useTooltip } from "../composables/useTooltip";
import { useInputClasses } from "../composables/useInputClasses";

const {
  unit,
  inputValue,
  isFocused,
  isHovering,
  shouldDisableDecrement,
  shouldDisableIncrement,
  handleFocus,
  handleBlur: handleInputLogicBlur,
  handleChange,
  incrementValue,
  decrementValue,
  switchUnit,
} = useInputLogic();

const {
  isShowTooltip,
  tooltipMessage,
  tooltipPosition,
  showTooltip,
  setTooltipPosition,
} = useTooltip();

const {
  getUnitButtonClasses,
  getInputContainerClasses,
  getDecrementButtonClasses,
  getInputClasses,
  getIncrementButtonClasses,
  getTooltipClasses,
} = useInputClasses({
  unit: computed(() => unit.value),
  isHovering: computed(() => isHovering.value),
  isFocused: computed(() => isFocused.value),
  shouldDisableDecrement: computed(() => shouldDisableDecrement.value),
  shouldDisableIncrement: computed(() => shouldDisableIncrement.value),
  isShowTooltip: computed(() => isShowTooltip.value),
  tooltipPosition: computed(() => tooltipPosition.value),
});

const handleBlur = () => {
  handleInputLogicBlur(showTooltip, setTooltipPosition);
};
</script>

<template>
  <div class="bg-[#151515] p-4 w-[280px] h-[120px] m-auto">
    <div class="mb-4 flex justify-between items-center">
      <div class="text-[#AAAAAA]">Unit</div>
      <div class="flex w-[140px] h-[36px] p-[2px] bg-[#212121] rounded-lg">
        <button
          @click="switchUnit('%')"
          :class="getUnitButtonClasses('%')"
        >
          %
        </button>
        <button
          @click="switchUnit('px')"
          :class="getUnitButtonClasses('px')"
        >
          px
        </button>
      </div>
    </div>

    <div class="flex justify-between items-center">
      <div class="text-[#AAAAAA]">Value</div>
        <div :class="getInputContainerClasses()">
          <button
            @click="decrementValue"
            :disabled="shouldDisableDecrement"
            :class="getDecrementButtonClasses()"
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
            :class="getInputClasses()"
          />
          <button
            @click="incrementValue"
            :disabled="shouldDisableIncrement"
            :class="getIncrementButtonClasses()"
          >
            <span class="text-xl mb-1">+</span>
          </button>

          <!-- Tooltip -->
          <div :class="getTooltipClasses()">
            {{ tooltipMessage }}
            <div class="absolute bottom-[-4px] left-1/2 h-[7px] w-[7px] 
            rotate-45 bg-[#212121] -translate-x-1/2"></div>
          </div>
        </div>
    </div>
  </div>
</template>
