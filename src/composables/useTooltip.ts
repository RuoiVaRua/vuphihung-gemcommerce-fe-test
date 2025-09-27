import { ref } from "vue";

export function useTooltip() {
  const isShowTooltip = ref(false);
  const tooltipMessage = ref("");
  const tooltipTimeout = ref<any>(0);
  const tooltipPosition = ref("center"); // left, center, right

  function showTooltip(message: string) {
    clearTimeout(tooltipTimeout.value);
    tooltipMessage.value = message;
    isShowTooltip.value = true;

    tooltipTimeout.value = setTimeout(() => {
      isShowTooltip.value = false;
    }, 5000);
  }

  function setTooltipPosition(position: string) {
    tooltipPosition.value = position;
  }

  return {
    isShowTooltip,
    tooltipMessage,
    tooltipPosition,
    showTooltip,
    setTooltipPosition,
  };
}
