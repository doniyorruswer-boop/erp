import AppButton from "../components/common/AppButton.vue";

export default {
  title: "Design System/AppButton",
  component: AppButton,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "outline", "success", "danger", "warning", "secondary", "ghost"],
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    fullWidth: { control: "boolean" },
    icon: { control: "text" },
  },
};

export const Primary = {
  args: {
    variant: "primary",
    size: "md",
    default: "Saqlash",
    icon: "heroicons:check-circle",
  },
  render: (args) => ({
    components: { AppButton },
    setup() {
      return { args };
    },
    template: '<AppButton v-bind="args">{{ args.default }}</AppButton>',
  }),
};

export const Outline = {
  args: {
    variant: "outline",
    size: "md",
    default: "Eksport qilish",
    icon: "heroicons:arrow-down-tray",
  },
  render: (args) => ({
    components: { AppButton },
    setup() {
      return { args };
    },
    template: '<AppButton v-bind="args">{{ args.default }}</AppButton>',
  }),
};

export const Danger = {
  args: {
    variant: "danger",
    size: "md",
    default: "O'chirish",
    icon: "heroicons:trash",
  },
  render: (args) => ({
    components: { AppButton },
    setup() {
      return { args };
    },
    template: '<AppButton v-bind="args">{{ args.default }}</AppButton>',
  }),
};

export const Loading = {
  args: {
    variant: "primary",
    size: "md",
    loading: true,
    default: "Yuklanmoqda...",
  },
  render: (args) => ({
    components: { AppButton },
    setup() {
      return { args };
    },
    template: '<AppButton v-bind="args">{{ args.default }}</AppButton>',
  }),
};

export const AllVariants = {
  render: () => ({
    components: { AppButton },
    template: `
      <div class="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl">
        <AppButton variant="primary" icon="heroicons:plus">Yangi qo'shish</AppButton>
        <AppButton variant="outline" icon="heroicons:arrow-down-tray">Eksport</AppButton>
        <AppButton variant="success" icon="heroicons:check">Tasdiqlash</AppButton>
        <AppButton variant="warning" icon="heroicons:exclamation-triangle">Ogohlantirish</AppButton>
        <AppButton variant="danger" icon="heroicons:trash">O'chirish</AppButton>
        <AppButton variant="secondary">Bekor qilish</AppButton>
        <AppButton variant="ghost">Yopish</AppButton>
      </div>
    `,
  }),
};
