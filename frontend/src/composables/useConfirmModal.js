import { ref } from "vue";

/**
 * Reusable confirm modal state composable adhering to AGENTS.md
 */
export function useConfirmModal() {
  const isOpen = ref(false);
  const targetItem = ref(null);
  const loading = ref(false);

  function open(item = null) {
    targetItem.value = item;
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
    targetItem.value = null;
    loading.value = false;
  }

  async function executeConfirm(callback) {
    loading.value = true;
    try {
      await callback(targetItem.value);
      close();
    } catch (e) {
      loading.value = false;
      throw e;
    }
  }

  return {
    isOpen,
    targetItem,
    loading,
    open,
    close,
    executeConfirm,
  };
}

export default useConfirmModal;
