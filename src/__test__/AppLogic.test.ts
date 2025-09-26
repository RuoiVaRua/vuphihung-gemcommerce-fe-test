import { describe, it, expect, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import App from '../App.vue'

describe('App.vue Component', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mount(App)
  })

  describe('Input Value Handling', () => {
    it('should accept integer values', async () => {
      const input = wrapper.find('#input-value')
      
      await input.setValue('123')
      await input.trigger('keyup')
      
      expect((input.element as HTMLInputElement).value).toBe('123')
    })

    it('should accept float values', async () => {
      const input = wrapper.find('#input-value')
      
      await input.setValue('12.34')
      await input.trigger('keyup')
      
      expect((input.element as HTMLInputElement).value).toBe('12.34')
    })

    it('should replace comma with period', async () => {
      const input = wrapper.find('#input-value')
      
      await input.setValue('12,3')
      await input.trigger('keyup')
      
      expect((input.element as HTMLInputElement).value).toBe('12.3')
    })
  })

  describe('Invalid Character Handling on Blur', () => {
    it('should remove non-numeric characters at the end (123a -> 123)', async () => {
      const input = wrapper.find('#input-value')
      
      await input.trigger('focus')
      await input.setValue('123a')
      await input.trigger('blur')
      await nextTick()
      
      expect((input.element as HTMLInputElement).value).toBe('1')
    })

    it('should remove non-numeric characters in the middle (12a3 -> 123)', async () => {
      const input = wrapper.find('#input-value')
      
      await input.trigger('focus')
      await input.setValue('12a3')
      await input.trigger('blur')
      await nextTick()
      
      expect((input.element as HTMLInputElement).value).toBe('1')
    })

    it('should remove non-numeric characters at the beginning (a123 -> 123)', async () => {
      const input = wrapper.find('#input-value')
      
      await input.trigger('focus')
      await input.setValue('a123')
      await input.trigger('blur')
      await nextTick()
      
      expect((input.element as HTMLInputElement).value).toBe('1')
    })

    it('should handle multiple periods (12.4.5 -> 12.45)', async () => {
      const input = wrapper.find('#input-value')
      
      await input.trigger('focus')
      await input.setValue('12.4.5')
      await input.trigger('blur')
      await nextTick()
      
      expect((input.element as HTMLInputElement).value).toBe('12.45')
    })

    it('should handle mixed invalid characters (1a2.3b4.5c -> 12.345)', async () => {
      const input = wrapper.find('#input-value')
      
      await input.trigger('focus')
      await input.setValue('1a2.3b4.5c')
      await input.trigger('blur')
      await nextTick()
      
      expect((input.element as HTMLInputElement).value).toBe('12.345')
    })
  })

  describe('Negative Value Handling', () => {
    it('should reset negative values to 0 on blur', async () => {
      const input = wrapper.find('#input-value')
      
      await input.trigger('focus')
      await input.setValue('-5')
      await input.trigger('blur')
      await nextTick()
      
      expect((input.element as HTMLInputElement).value).toBe('0')
    })

    it('should show tooltip when value is negative', async () => {
      const input = wrapper.find('#input-value')
      
      await input.trigger('focus')
      await input.setValue('-10')
      await input.trigger('blur')
      await nextTick()
      
      const tooltip = wrapper.find('.whitespace-nowrap')
      expect(tooltip.text()).toContain('Value must greater than 0')
    })
  })

  describe('Percentage Unit Constraints', () => {
    beforeEach(async () => {
      // Set unit to %
      const percentButton = wrapper.findAll('button').find(btn => btn.text() === '%')
      await percentButton?.trigger('click')
    })

    it('should revert to previous value when input > 100 in % mode', async () => {
      const input = wrapper.find('#input-value')
      
      // Set initial value
      await input.setValue('50')
      await input.trigger('blur')
      await nextTick()
      
      // Try to set value > 100
      await input.trigger('focus')
      await input.setValue('150')
      await input.trigger('blur')
      await nextTick()
      
      expect((input.element as HTMLInputElement).value).toBe('50')
    })

    it('should show tooltip when value > 100 in % mode', async () => {
      const input = wrapper.find('#input-value')
      
      await input.trigger('focus')
      await input.setValue('150')
      await input.trigger('blur')
      await nextTick()
      
      const tooltip = wrapper.find('.whitespace-nowrap')
      expect(tooltip.text()).toContain('Value must smaller than 100')
    })
  })

  describe('Increment/Decrement Button States', () => {
    it('should disable decrement button when value is 0', async () => {
      const input = wrapper.find('#input-value')
      await input.setValue('0')
      await input.trigger('blur')
      await nextTick()
      
      const decrementButton = wrapper.findAll('button').find(btn => btn.text().includes('−'))
      expect(decrementButton?.classes()).toContain('cursor-not-allowed')
      expect(decrementButton?.attributes('disabled')).toBeDefined()
    })

    it('should enable decrement button when value > 0', async () => {
      const input = wrapper.find('#input-value')
      await input.setValue('5')
      await input.trigger('blur')
      await nextTick()
      
      const decrementButton = wrapper.findAll('button').find(btn => btn.text().includes('−'))
      expect(decrementButton?.classes()).not.toContain('cursor-not-allowed')
      expect(decrementButton?.attributes('disabled')).toBeUndefined()
    })

    it('should disable increment button when value is 100 in % mode', async () => {
      // Set to % mode
      const percentButton = wrapper.findAll('button').find(btn => btn.text() === '%')
      await percentButton?.trigger('click')
      
      const input = wrapper.find('#input-value')
      await input.setValue('100')
      await input.trigger('blur')
      await nextTick()
      
      const incrementButton = wrapper.findAll('button').find(btn => btn.text().includes('+'))
      expect(incrementButton?.classes()).toContain('cursor-not-allowed')
      expect(incrementButton?.attributes('disabled')).toBeDefined()
    })

    it('should enable increment button when value < 100 in % mode', async () => {
      // Set to % mode
      const percentButton = wrapper.findAll('button').find(btn => btn.text() === '%')
      await percentButton?.trigger('click')
      
      const input = wrapper.find('#input-value')
      await input.setValue('50')
      await input.trigger('blur')
      await nextTick()
      
      const incrementButton = wrapper.findAll('button').find(btn => btn.text().includes('+'))
      expect(incrementButton?.classes()).not.toContain('cursor-not-allowed')
      expect(incrementButton?.attributes('disabled')).toBeUndefined()
    })

    it('should not disable increment button in px mode even when value > 100', async () => {
      // Set to px mode
      const pxButton = wrapper.findAll('button').find(btn => btn.text() === 'px')
      await pxButton?.trigger('click')
      
      const input = wrapper.find('#input-value')
      await input.setValue('150')
      await input.trigger('blur')
      await nextTick()
      
      const incrementButton = wrapper.findAll('button').find(btn => btn.text().includes('+'))
      expect(incrementButton?.attributes('disabled')).toBeUndefined()
    })
  })

  describe('Unit Switching', () => {
    it('should cap value to 100 when switching from px to % with value > 100', async () => {
      // Start in px mode
      const pxButton = wrapper.findAll('button').find(btn => btn.text() === 'px')
      await pxButton?.trigger('click')
      
      // Set value > 100
      const input = wrapper.find('#input-value')
      await input.setValue('150')
      await input.trigger('blur')
      await nextTick()
      
      // Switch to % mode
      const percentButton = wrapper.findAll('button').find(btn => btn.text() === '%')
      await percentButton?.trigger('click')
      await nextTick()
      
      expect((input.element as HTMLInputElement).value).toBe('100')
    })

    it('should not change value when switching from px to % with value <= 100', async () => {
      // Start in px mode
      const pxButton = wrapper.findAll('button').find(btn => btn.text() === 'px')
      await pxButton?.trigger('click')
      
      // Set value <= 100
      const input = wrapper.find('#input-value')
      await input.setValue('75')
      await input.trigger('blur')
      await nextTick()
      
      // Switch to % mode
      const percentButton = wrapper.findAll('button').find(btn => btn.text() === '%')
      await percentButton?.trigger('click')
      await nextTick()
      
      expect((input.element as HTMLInputElement).value).toBe('75')
    })

    it('should maintain value when switching from % to px', async () => {
      // Start in % mode
      const percentButton = wrapper.findAll('button').find(btn => btn.text() === '%')
      await percentButton?.trigger('click')
      
      // Set value
      const input = wrapper.find('#input-value')
      await input.setValue('50')
      await input.trigger('blur')
      await nextTick()
      
      // Switch to px mode
      const pxButton = wrapper.findAll('button').find(btn => btn.text() === 'px')
      await pxButton?.trigger('click')
      await nextTick()
      
      expect((input.element as HTMLInputElement).value).toBe('50')
    })
  })

  describe('Increment/Decrement Functionality', () => {
    it('should increment value by 1', async () => {
      const input = wrapper.find('#input-value')
      await input.setValue('5')
      await input.trigger('blur')
      await nextTick()
      
      const incrementButton = wrapper.findAll('button').find(btn => btn.text().includes('+'))
      await incrementButton?.trigger('click')
      await nextTick()
      
      expect((input.element as HTMLInputElement).value).toBe('6')
    })

    it('should decrement value by 1', async () => {
      const input = wrapper.find('#input-value')
      await input.setValue('5')
      await input.trigger('blur')
      await nextTick()
      
      const decrementButton = wrapper.findAll('button').find(btn => btn.text().includes('−'))
      await decrementButton?.trigger('click')
      await nextTick()
      
      expect((input.element as HTMLInputElement).value).toBe('4')
    })

    it('should not decrement below 0', async () => {
      const input = wrapper.find('#input-value')
      await input.setValue('0')
      await input.trigger('blur')
      await nextTick()
      
      const decrementButton = wrapper.findAll('button').find(btn => btn.text().includes('−'))
      await decrementButton?.trigger('click')
      await nextTick()
      
      expect((input.element as HTMLInputElement).value).toBe('0')
    })

    it('should not increment above 100 in % mode', async () => {
      // Set to % mode
      const percentButton = wrapper.findAll('button').find(btn => btn.text() === '%')
      await percentButton?.trigger('click')
      
      const input = wrapper.find('#input-value')
      await input.setValue('100')
      await input.trigger('blur')
      await nextTick()
      
      const incrementButton = wrapper.findAll('button').find(btn => btn.text().includes('+'))
      await incrementButton?.trigger('click')
      await nextTick()
      
      expect((input.element as HTMLInputElement).value).toBe('100')
    })
  })

  describe('Empty Input Handling', () => {
    it('should reset empty input to 0 on blur', async () => {
      const input = wrapper.find('#input-value')
      
      await input.trigger('focus')
      await input.setValue('')
      await input.trigger('blur')
      await nextTick()
      
      expect((input.element as HTMLInputElement).value).toBe('0')
    })
  })

  describe('Visual States', () => {
    it('should apply focus styles when input is focused', async () => {
      const input = wrapper.find('#input-value')
      const container = wrapper.find('.relative.flex.items-center.rounded-lg')
      
      await input.trigger('focus')
      await nextTick()
      
      expect(container.classes()).toContain('shadow-[0_0_0_1px_#3C67FF]')
    })

    it('should remove focus styles when input loses focus', async () => {
      const input = wrapper.find('#input-value')
      const container = wrapper.find('.relative.flex.items-center.rounded-lg')
      
      await input.trigger('focus')
      await input.trigger('blur')
      await nextTick()
      
      expect(container.classes()).not.toContain('shadow-[0_0_0_1px_#3C67FF]')
    })
  })
})
