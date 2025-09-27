import type { ComputedRef } from "vue";

interface InputClassProps {
  unit: ComputedRef<string>;
  isHovering: ComputedRef<boolean>;
  isFocused: ComputedRef<boolean>;
  shouldDisableDecrement: ComputedRef<boolean>;
  shouldDisableIncrement: ComputedRef<boolean>;
  isShowTooltip: ComputedRef<boolean>;
  tooltipPosition: ComputedRef<string>;
}

export function useInputClasses(props: InputClassProps) {
  const getUnitButtonClasses = (buttonUnit: string) => {
    return [
      "px-4 h-full w-50 flex justify-center items-center rounded-[6px]",
      props.unit.value === buttonUnit
        ? "bg-[#424242] text-[#F9F9F9]"
        : "bg-[#212121] text-[#AAAAAA]",
    ];
  };

  const getInputContainerClasses = () => {
    return [
      "relative flex items-center rounded-lg w-[140px] h-[36px]",
      props.isHovering.value ? "bg-[#424242]" : "bg-[#212121]",
      props.isFocused.value ? "shadow-[0_0_0_1px_#3C67FF] rounded-lg" : "",
    ];
  };

  const getDecrementButtonClasses = () => {
    return [
      "px-3 h-full w-[36px] z-1 rounded-l-lg flex justify-center items-center",
      props.shouldDisableDecrement.value
        ? "text-[#3B3B3B] cursor-not-allowed"
        : "text-[#F9F9F9] hover:bg-[#424242]",
    ];
  };

  const getInputClasses = () => {
    return [
      "text-[#F9F9F9] text-center w-full outline-none z-1",
      props.isHovering.value ? "bg-[#424242]" : "bg-[#212121]",
    ];
  };

  const getIncrementButtonClasses = () => {
    return [
      "px-3 h-full w-[36px] z-1 rounded-r-lg flex justify-center items-center",
      props.shouldDisableIncrement.value
        ? "text-[#3B3B3B] cursor-not-allowed"
        : "text-[#F9F9F9] hover:bg-[#424242]",
    ];
  };

  const getTooltipClasses = () => {
    return [
      `absolute w-fit top-0 opacity-0 transition-all ease-in-out duration-200 whitespace-nowrap 
      z-0 mt-2 bg-[#212121] text-[#F9F9F9] text-sm px-3 py-1 rounded-lg`,
      props.isShowTooltip.value ? "opacity-100 top-[calc(-100%-8px)]" : "opacity-0 top-0",
      props.tooltipPosition.value === "left" && "left-[-53%]",
      props.tooltipPosition.value === "right" && "right-[-58%]",
      props.tooltipPosition.value === "center" && "left-[50%] -translate-x-1/2",
    ];
  };

  return {
    getUnitButtonClasses,
    getInputContainerClasses,
    getDecrementButtonClasses,
    getInputClasses,
    getIncrementButtonClasses,
    getTooltipClasses,
  };
}
