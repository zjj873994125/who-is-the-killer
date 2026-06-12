import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import FloatingPhoneMessages from '../src/case-engine/components/FloatingPhoneMessages.vue';

const contacts = [
  {
    id: 'bao',
    name: '包斩',
    role: '特案组',
    avatarId: 'baozhan',
    avatarText: '包',
    messages: [
      {
        from: 'other' as const,
        text: '先看现场。',
      },
      {
        from: 'self' as const,
        text: '收到。',
      },
    ],
  },
];

describe('FloatingPhoneMessages', () => {
  it('shows a badge with the number of received messages', () => {
    const wrapper = mount(FloatingPhoneMessages, {
      props: {
        contacts,
      },
      global: {
        stubs: {
          ElIcon: {
            template: '<span><slot /></span>',
          },
          Transition: false,
        },
      },
    });

    expect(wrapper.find('.phone-fab-badge').text()).toBe('1');
    expect(wrapper.find('.phone-fab').attributes('aria-label')).toContain('1 条消息');
  });

  it('toggles the phone panel from the floating button', async () => {
    const wrapper = mount(FloatingPhoneMessages, {
      props: {
        contacts,
      },
      global: {
        stubs: {
          ElIcon: {
            template: '<span><slot /></span>',
          },
          Transition: false,
        },
      },
    });

    const toggleButton = wrapper.find('.phone-fab');

    expect(wrapper.find('.phone-shell').exists()).toBe(false);

    await toggleButton.trigger('click');
    expect(wrapper.find('.phone-shell').exists()).toBe(true);

    await toggleButton.trigger('click');
    expect(wrapper.find('.phone-shell').exists()).toBe(false);
  });

  it('uses image avatars in the contact list and chat bubbles', async () => {
    const wrapper = mount(FloatingPhoneMessages, {
      props: {
        contacts,
      },
      global: {
        stubs: {
          ElIcon: {
            template: '<span><slot /></span>',
          },
          Transition: false,
        },
      },
    });

    await wrapper.find('.phone-fab').trigger('click');

    const contactAvatar = wrapper.find('.phone-thread .phone-avatar');
    expect(contactAvatar.attributes('style')).toContain('squad-avatars-sprite.png');
    expect(contactAvatar.text()).toBe('');

    await wrapper.find('.phone-thread').trigger('click');

    const otherMessageAvatar = wrapper.find('.phone-bubble-row.other .phone-avatar');
    expect(otherMessageAvatar.attributes('style')).toContain('squad-avatars-sprite.png');
    expect(otherMessageAvatar.text()).toBe('');
  });
});
