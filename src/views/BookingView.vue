<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTripStore } from "../stores/tripStore";
import BaseBottomSheet from "../components/ui/BaseBottomSheet.vue";
import BookingForm from "../components/trip/BookingForm.vue";
import { ChevronLeft, Plane, Bed, Ticket, Plus } from "../assets/icons";
import type { Trip, Booking } from "../types/trip";

const route = useRoute();
const router = useRouter();
const tripStore = useTripStore();
const tripId = route.params.id as string;

const trip = ref<Trip | null>(null);
const isSheetOpen = ref(false);
const currentBooking = ref<Partial<Booking> | null>(null);
const isSaving = ref(false);

const fetchTripData = async () => {
  if (tripId) {
    trip.value = await tripStore.fetchTripById(tripId);
  }
};

onMounted(fetchTripData);

const bookings = computed(() => trip.value?.bookings || []);

const goBack = () => {
  router.push("/");
};

const openEditSheet = (booking?: Booking) => {
  currentBooking.value = booking
    ? { ...booking }
    : { type: "flight", isConfirmed: true };
  isSheetOpen.value = true;
};

const handleSaveBooking = async (updatedBooking: Booking) => {
  if (!tripId || isSaving.value) return;

  try {
    isSaving.value = true;
    await tripStore.updateTripBooking(tripId, updatedBooking);
    await fetchTripData(); // 重新獲取資料以更新 UI
    isSheetOpen.value = false;
  } catch (error) {
    console.error("儲存預訂失敗:", error);
    alert("儲存失敗，請稍後再試");
  } finally {
    isSaving.value = false;
  }
};

const handleDeleteBooking = async () => {
  if (!tripId || !currentBooking.value?.id || isSaving.value) return;

  if (!confirm("確定要刪除此預訂資訊嗎？")) return;

  try {
    isSaving.value = true;
    await tripStore.deleteTripBooking(tripId, currentBooking.value.id);
    await fetchTripData();
    isSheetOpen.value = false;
  } catch (error) {
    console.error("刪除預訂失敗:", error);
    alert("刪除失敗，請稍後再試");
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen pb-32 animate-fade-in bg-cream-light/30">
    <!-- Header -->
    <header class="px-6 pt-8 pb-4 flex justify-between items-start">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <button
            @click="goBack"
            class="p-1 -ml-1 text-forest-300 hover:text-forest-500 transition-colors"
          >
            <ChevronLeft :size="24" :stroke-width="2.5" />
          </button>
          <h1 class="text-2xl font-rounded font-bold text-forest-800">
            預訂行程
          </h1>
        </div>
        <p class="text-gray-500 text-sm ml-8">管理你的機票、住宿與票券</p>
      </div>
    </header>

    <main class="px-6 space-y-6 mt-4">
      <div
        v-if="bookings.length === 0"
        class="py-20 text-center bg-white/50 rounded-3xl border-2 border-dashed border-forest-100"
      >
        <div class="text-forest-200 mb-2 flex justify-center">
          <Ticket :size="40" stroke-width="1.5" />
        </div>
        <p class="text-gray-500 font-medium">還沒有任何預訂資料</p>
      </div>

      <div
        v-for="booking in bookings"
        :key="booking.id"
        @click="openEditSheet(booking as Booking)"
        class="card-base !p-0 overflow-hidden cursor-pointer hover:shadow-soft-lg active:scale-[0.98] transition-all"
      >
        <div v-if="booking.type === 'flight'" class="flex flex-col">
          <div
            class="bg-forest-400 p-4 text-white flex justify-between items-center"
          >
            <span class="font-bold">{{ booking.title }}</span>
            <span class="text-xs opacity-80">{{ booking.dateTime }}</span>
          </div>
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <div class="text-center flex-1">
                <div class="text-3xl font-bold text-forest-800">
                  {{ booking.location?.split("->")?.[0]?.trim() || "---" }}
                </div>
              </div>
              <div class="flex-1 flex flex-col items-center px-4">
                <div
                  class="w-full border-t-2 border-dashed border-forest-200 relative"
                >
                  <Plane
                    :size="20"
                    fill="currentColor"
                    class="text-forest-400 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90"
                  />
                </div>
              </div>
              <div class="text-center flex-1">
                <div class="text-3xl font-bold text-forest-800">
                  {{ booking.location?.split("->")?.[1]?.trim() || "---" }}
                </div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
              <div>
                <div class="text-[10px] text-gray-400 uppercase font-bold">
                  Confirmation
                </div>
                <div class="text-lg font-bold text-forest-700">
                  {{ booking.confirmationNo }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-[10px] text-gray-400 uppercase font-bold">
                  Status
                </div>
                <div
                  class="text-sm font-bold"
                  :class="
                    booking.isConfirmed ? 'text-forest-500' : 'text-coral-red'
                  "
                >
                  {{ booking.isConfirmed ? "已確認" : "處理中" }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="p-6">
          <div class="items-start flex gap-4">
            <div
              class="w-12 h-12 bg-lavender/20 rounded-xl flex items-center justify-center text-lavender flex-shrink-0"
            >
              <Bed v-if="booking.type === 'hotel'" :size="24" />
              <Ticket v-else :size="24" />
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-forest-800">{{ booking.title }}</h3>
              <p class="text-sm text-gray-500">{{ booking.location }}</p>
              <div class="mt-4 flex justify-between items-end">
                <div class="space-y-1">
                  <div class="text-[10px] text-gray-400 uppercase font-bold">
                    Time
                  </div>
                  <div class="text-sm font-medium text-forest-700">
                    {{ booking.dateTime }}
                  </div>
                </div>
                <div
                  v-if="booking.confirmationNo"
                  class="text-xs font-bold text-forest-400 bg-forest-50 px-2 py-1 rounded"
                >
                  #{{ booking.confirmationNo }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- FAB: Add Item -->
    <button
      @click="openEditSheet()"
      class="fixed bottom-28 right-6 w-14 h-14 bg-forest-400 text-white rounded-2xl shadow-soft-lg hover:bg-forest-500 hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer z-50"
    >
      <Plus :size="28" :stroke-width="2.5" />
    </button>

    <!-- Edit Booking Sheet -->
    <BaseBottomSheet
      :is-open="isSheetOpen"
      :title="currentBooking?.id ? '編輯預訂' : '新增預訂'"
      @close="isSheetOpen = false"
    >
      <BookingForm
        v-if="currentBooking"
        :initial-data="currentBooking"
        @save="handleSaveBooking"
        @delete="handleDeleteBooking"
      />
    </BaseBottomSheet>

    <!-- Global Loading Overlay -->
    <div
      v-if="isSaving"
      class="fixed inset-0 bg-white/50 backdrop-blur-sm z-[200] flex items-center justify-center"
    >
      <div
        class="w-12 h-12 border-4 border-forest-100 border-t-forest-400 rounded-full animate-spin"
      ></div>
    </div>
  </div>
</template>
