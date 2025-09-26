import { mount } from '@vue/test-utils';
import { expect, it, describe, beforeEach, afterEach, vi } from "vitest";
import App from "../App.vue";

describe('App.vue Logic', () => {
  let wrapper: ReturnType<typeof mount>;
  let vm: any;

  beforeEach(() => {
    wrapper = mount(App);
    vm = wrapper.vm as any;
    vi.useFakeTimers(); // Mock timers for showTooltip
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Yêu cầu 1: Cho phép nhập các giá trị integer và float
  describe('Input handling (integer and float)', () => {
    it('should allow integer values via handleChange', async () => {
      vm.inputValue.value = '123';
      await vm.$nextTick();
      vm.handleChange();
      expect(vm.value.value).toBe(123);
      expect(vm.inputValue.value).toBe('123');
    });

    it('should allow float values via handleChange', async () => {
      vm.inputValue.value = '12.34';
      await vm.$nextTick();
      vm.handleChange();
      expect(vm.value.value).toBe(12.34);
      expect(vm.inputValue.value).toBe('12.34');
    });

    it('should allow integer values via handleBlur', async () => {
      vm.inputValue.value = '456';
      await vm.$nextTick();
      vm.handleBlur();
      expect(vm.value.value).toBe(456);
      expect(vm.inputValue.value).toBe('456');
    });

    it('should allow float values via handleBlur', async () => {
      vm.inputValue.value = '56.78';
      await vm.$nextTick();
      vm.handleBlur();
      expect(vm.value.value).toBe(56.78);
      expect(vm.inputValue.value).toBe('56.78');
    });
  });

  // Yêu cầu 2: Nếu input chứa dấu phẩy -> Thay thế thành dấu chấm: 12,3 -> 12.3
  describe('Comma to period replacement', () => {
    it('should replace comma with period in inputValue on handleChange', async () => {
      vm.inputValue.value = '12,3';
      await vm.$nextTick();
      vm.handleChange();
      expect(vm.value.value).toBe(12.3);
      expect(vm.inputValue.value).toBe('12.3');
    });

    it('should replace comma with period in inputValue on handleBlur', async () => {
      vm.inputValue.value = '123,45';
      await vm.$nextTick();
      vm.handleBlur();
      expect(vm.value.value).toBe(123.45);
      expect(vm.inputValue.value).toBe('123.45');
    });
  });

  // Yêu cầu 3: Nếu input chứa các kí tự khác giá trị số phù hợp => tự động loại bỏ các giá trị
  describe('Input sanitization on blur', () => {
    it('should remove trailing non-numeric characters: 123a -> 123', async () => {
      vm.inputValue.value = '123a';
      await vm.$nextTick();
      vm.handleBlur();
      expect(vm.value.value).toBe(123);
      expect(vm.inputValue.value).toBe('123');
    });

    it('should remove internal non-numeric characters: 12a3 -> 12', async () => {
      vm.inputValue.value = '12a3';
      await vm.$nextTick();
      vm.handleBlur();
      expect(vm.value.value).toBe(12);
      expect(vm.inputValue.value).toBe('12');
    });

    it('should remove leading non-numeric characters: a123 -> 123', async () => {
      vm.inputValue.value = 'a123';
      await vm.$nextTick();
      vm.handleBlur();
      expect(vm.value.value).toBe(123);
      expect(vm.inputValue.value).toBe('123');
    });

    it('should handle multiple periods: 12.4.5 → 12.45', async () => {
      vm.inputValue.value = '12.4.5';
      await vm.$nextTick();
      vm.handleBlur();
      expect(vm.value.value).toBe(12.45);
      expect(vm.inputValue.value).toBe('12.45');
    });

    it('should handle mixed invalid characters and commas', async () => {
      vm.inputValue.value = 'abc-1,2.3.4def';
      await vm.$nextTick();
      vm.handleBlur();
      expect(vm.value.value).toBe(-1.234);
      expect(vm.inputValue.value).toBe('-1.234');
    });
  });

  // Yêu cầu 4: User nhập < 0 và out focus sẽ tự động nhảy về 0
  describe('Value less than 0 on blur', () => {
    it('should reset value to 0 and show tooltip if input is empty on blur', async () => {
      const showTooltipSpy = vi.spyOn(vm, 'showTooltip');
      vm.inputValue.value = '';
      vm.value.value = 10; // Initial value
      await vm.$nextTick();
      vm.handleBlur();
      expect(vm.inputValue.value).toBe('0');
      expect(vm.value.value).toBe(0);
      expect(showTooltipSpy).toHaveBeenCalledWith('Value must greater than 0');
      expect(vm.tooltipPosition.value).toBe('left');
    });

    it('should reset value to 0 and show tooltip if input is negative on blur', async () => {
      const showTooltipSpy = vi.spyOn(vm, 'showTooltip');
      vm.inputValue.value = '-5';
      vm.value.value = 10; // Initial value
      await vm.$nextTick();
      vm.handleBlur();
      expect(vm.inputValue.value).toBe('0');
      expect(vm.value.value).toBe(0);
      expect(showTooltipSpy).toHaveBeenCalledWith('Value must greater than 0');
      expect(vm.tooltipPosition.value).toBe('left');
    });
  });

  // Yêu cầu 5: Nếu Unit là %
  describe('Percentage unit specific logic', () => {
    beforeEach(async () => {
      vm.unit.value = '%';
      await vm.$nextTick();
    });

    // User nhập > 100 và out focus sẽ tự động nhảy về giá trị hợp lệ trước khi nhập
    it('should cap value at previousValidValue and show tooltip if input > 100 on blur', async () => {
      const showTooltipSpy = vi.spyOn(vm, 'showTooltip');
      vm.previousValidValue.value = 50;
      vm.inputValue.value = '120';
      vm.value.value = 120; // Simulate value being updated by handleChange before blur
      await vm.$nextTick();
      vm.handleBlur();
      expect(vm.value.value).toBe(50);
      expect(vm.inputValue.value).toBe('50');
      expect(showTooltipSpy).toHaveBeenCalledWith('Value must smaller than 100');
      expect(vm.tooltipPosition.value).toBe('right');
    });

    // Nếu giá trị trong ô input hiện tại là 0 => Disable button “-”
    it('should disable decrement button when value is 0', async () => {
      vm.value.value = 0;
      await vm.$nextTick();
      expect(vm.shouldDisableDecrement).toBe(true);
    });

    // Nếu giá trị trong ô input hiện tại là 100 => Disable button “+”
    it('should disable increment button when value is 100', async () => {
      vm.value.value = 100;
      await vm.$nextTick();
      expect(vm.shouldDisableIncrement).toBe(true);
    });

    it('should not disable increment button when value is 99', async () => {
      vm.value.value = 99;
      await vm.$nextTick();
      expect(vm.shouldDisableIncrement).toBe(false);
    });
  });

  // Yêu cầu 6: Nếu switch từ px sang % và giá trị hiện tại lớn hơn 100 => Update về 100
  describe('Switch unit from px to %', () => {
    it('should update value to 100 if switching from px to % and value > 100', async () => {
      vm.unit.value = 'px';
      vm.value.value = 150;
      vm.inputValue.value = '150';
      await vm.$nextTick();
      vm.switchUnit('%');
      expect(vm.unit.value).toBe('%');
      expect(vm.value.value).toBe(100);
      expect(vm.inputValue.value).toBe('100');
    });

    it('should not update value if switching from px to % and value <= 100', async () => {
      vm.unit.value = 'px';
      vm.value.value = 75;
      vm.inputValue.value = '75';
      await vm.$nextTick();
      vm.switchUnit('%');
      expect(vm.unit.value).toBe('%');
      expect(vm.value.value).toBe(75);
      expect(vm.inputValue.value).toBe('75');
    });
  });
});
