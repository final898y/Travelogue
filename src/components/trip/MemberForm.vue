<script setup lang="ts">
/**
 * MemberForm (Component)
 * Specialized form for managing trip members.
 */
import { reactive, ref, watch } from "vue";
import { UserPlus, X } from "../../assets/icons";
import { useUIStore } from "../../stores/uiStore";
import type { TripMember } from "../../types/trip";

const props = defineProps<{
  initialMembers: TripMember[];
  currentUserEmail: string;
}>();

const emit = defineEmits<{
  (e: "save", members: TripMember[]): void;
  (e: "update:dirty", isDirty: boolean): void;
}>();

const uiStore = useUIStore();

// 建立局部狀態副本 (使用深拷貝避免改到 props)
const members = reactive<TripMember[]>(
  JSON.parse(JSON.stringify(props.initialMembers)),
);
const newMemberName = ref("");
const editingMemberId = ref<string | null>(null);
const editValue = ref("");

const startEdit = (member: TripMember) => {
  editingMemberId.value = member.id;
  editValue.value = member.name;
};

const saveEdit = () => {
  if (!editingMemberId.value) return;
  const name = editValue.value.trim();
  if (name) {
    const targetMember = members.find((m) => m.id === editingMemberId.value);
    if (targetMember) targetMember.name = name;
  }
  editingMemberId.value = null;
};

const addMember = () => {
  const name = newMemberName.value.trim();
  if (!name) return;
  if (members.some((m) => m.name === name)) {
    return uiStore.showToast("旅伴名稱重複", "warning");
  }
  const newId = `member_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  members.push({ id: newId, name });
  newMemberName.value = "";
};

const removeMember = async (id: string) => {
  if (id === props.currentUserEmail) return;

  const confirmed = await uiStore.showConfirm({
    title: "移除旅伴？",
    message:
      "刪除旅伴後，相關的記帳紀錄將會顯示為『已移除旅伴』，確定要刪除嗎？",
    okText: "移除",
    cancelText: "保留",
  });

  if (confirmed) {
    const idx = members.findIndex((m) => m.id === id);
    if (idx > -1) {
      members.splice(idx, 1);
      // 如果正在編輯該成員，則取消編輯狀態
      if (editingMemberId.value === id) {
        editingMemberId.value = null;
      }
    }
  }
};

watch(
  members,
  (newVal) => {
    const isDirty =
      JSON.stringify(newVal) !== JSON.stringify(props.initialMembers);
    emit("update:dirty", isDirty);
  },
  { deep: true },
);

const handleSave = () => {
  if (members.length === 0) {
    return uiStore.showToast("旅伴名單不能為空", "warning");
  }
  emit("save", [...members]);
};

// 自定義指令讓輸入框自動聚焦
const vFocus = {
  mounted: (el: HTMLInputElement) => el.focus(),
};
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-3">
      <label class="text-xs font-bold text-forest-300 uppercase tracking-wider">
        編輯旅伴名單 ({{ members.length }})
      </label>

      <div class="flex gap-2">
        <div class="relative flex-1">
          <input
            v-model="newMemberName"
            type="text"
            placeholder="輸入旅伴姓名"
            class="w-full p-3 rounded-xl bg-white border border-forest-50 focus:border-forest-200 outline-none text-sm shadow-sm"
            @keyup.enter="addMember"
          />
        </div>
        <button
          @click="addMember"
          type="button"
          class="px-4 bg-forest-50 text-forest-500 rounded-xl hover:bg-forest-100 transition-colors cursor-pointer"
        >
          <UserPlus :size="20" />
        </button>
      </div>

      <!-- Member Tags -->
      <div class="flex flex-wrap gap-2 pt-2">
        <div
          v-for="member in members"
          :key="member.id"
          class="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-forest-100 text-xs font-bold text-forest-600 shadow-soft-sm animate-fade-in group"
        >
          <template v-if="editingMemberId === member.id">
            <input
              v-model="editValue"
              v-focus
              class="w-20 outline-none border-b border-forest-300 bg-transparent"
              @blur="saveEdit"
              @keyup.enter="saveEdit"
            />
          </template>
          <template v-else>
            <span
              class="cursor-pointer hover:text-forest-400"
              @click="startEdit(member)"
            >
              {{ member.name }}
            </span>
            <button
              v-if="member.id !== currentUserEmail"
              @click="removeMember(member.id)"
              class="text-forest-200 hover:text-red-400 p-0.5 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X :size="14" :stroke-width="2.5" />
            </button>
          </template>
        </div>
      </div>
    </div>

    <div class="pt-4 text-center">
      <p class="text-[10px] text-forest-300 mb-4 px-4 italic">
        提示：修改旅伴名稱後，系統會自動關聯既有的記帳紀錄。
      </p>
      <button
        @click="handleSave"
        class="w-full py-4 rounded-2xl bg-forest-400 text-white font-bold shadow-soft-lg hover:bg-forest-500 active:scale-95 transition-all cursor-pointer"
      >
        儲存名單
      </button>
    </div>
  </div>
</template>
