<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-lexend"
        @click.self="close"
      >
        <div
          class="modal-window relative w-full max-w-3xl min-h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 flex flex-col max-h-[92vh] overflow-hidden"
          @click.stop
        >
        <!-- Modal Header -->
        <div class="p-4 sm:px-6 border-b dark:border-gray-700 flex items-center justify-between bg-gray-50/70 dark:bg-gray-800/80">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Icon :icon="headerIcon" class="text-2xl" />
            </div>
            <div>
              <h2 class="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100">
                {{ modalTitle }}
              </h2>
              <p class="text-xs text-gray-400">
                Bosqich {{ currentStep }} / {{ totalSteps }}: {{ currentStepTitle }}
              </p>
            </div>
          </div>

          <button
            type="button"
            class="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
            @click="close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-width="2"
                d="M6 18L18 6m0 12L6 6"
              />
            </svg>
          </button>
        </div>

        <!-- Step Indicator Progress Bar -->
        <div class="px-4 sm:px-6 pt-3 pb-2 border-b dark:border-gray-700/60 bg-white dark:bg-gray-800">
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="(st, idx) in dynamicSteps"
              :key="st.id"
              type="button"
              @click="goToStep(idx + 1)"
              :disabled="idx + 1 > currentStep && !isStep1Valid"
              :class="[
                'flex items-center gap-2 p-2 rounded-lg text-left text-xs transition cursor-pointer',
                currentStep === idx + 1
                  ? 'bg-primary/10 text-primary font-bold border border-primary/30'
                  : currentStep > idx + 1
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-medium'
                  : 'bg-gray-50 dark:bg-gray-900/40 text-gray-400 opacity-70'
              ]"
            >
              <div
                class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold"
                :class="[
                  currentStep === idx + 1
                    ? 'bg-primary text-white'
                    : currentStep > idx + 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                ]"
              >
                <Icon v-if="currentStep > idx + 1" icon="solar:check-read-linear" class="text-xs" />
                <span v-else>{{ idx + 1 }}</span>
              </div>
              <span class="truncate hidden sm:inline">{{ st.shortTitle }}</span>
            </button>
          </div>
        </div>

        <!-- Step Body Container -->
        <div class="p-4 sm:p-6 pb-20 overflow-y-auto flex-1 text-sm space-y-4">
          <!-- ========================================== -->
          <!-- STEP 1: SHAXSIY VA HUJJAT MA'LUMOTLARI      -->
          <!-- ========================================== -->
          <div v-show="currentStep === 1" class="space-y-3.5 animate-fade-in">
            <div class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
              {{ isKindergarten ? "Bolaning shaxsiy ma'lumotlari" : "O'quvchining shaxsiy ma'lumotlari" }}
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormInput
                v-model="form.lastName"
                label="Familiyasi"
                required
                placeholder="Familiyasini kiriting"
                icon="solar:user-linear"
              />
              <FormInput
                v-model="form.firstName"
                label="Ismi"
                required
                placeholder="Ismini kiriting"
                icon="solar:user-linear"
              />
              <FormInput
                v-model="form.middleName"
                label="Otasining ismi (Sharifi)"
                :placeholder="isSchool || isKindergarten ? 'Otasining ismini kiriting' : 'Ixtiyoriy'"
                icon="solar:user-linear"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormDatePicker
                v-model="form.birthDate"
                label="Tug'ilgan sana"
                placeholder="Sanani tanlang"
                required
              />
              <FormSelect
                v-model="form.gender"
                label="Jinsi"
                :options="[
                  { value: 'MALE', label: isKindergarten ? 'O\'g\'il bola' : 'Erkak' },
                  { value: 'FEMALE', label: isKindergarten ? 'Qiz bola' : 'Ayol' },
                ]"
              />
              <FormSelect
                v-model="form.nationality"
                label="Millati"
                :options="nationalityOptions"
              />
            </div>

            <!-- Guvohnoma & Pasport / PINFL Bloki -->
            <div class="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border dark:border-gray-700/60 space-y-3">
              <div class="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Icon icon="solar:document-text-bold" class="text-primary text-base" />
                <span>{{ isKindergarten ? "Tug'ilganlik haqida guvohnoma (Metrika)" : "Guvohnoma yoki Pasport / ID-karta" }}</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormInput
                  v-model="form.certSeries"
                  label="Guvohnoma seriyasi"
                  placeholder="Masalan: I-TN"
                  icon="solar:card-2-linear"
                />
                <FormInput
                  v-model="form.certNumber"
                  label="Guvohnoma raqami"
                  placeholder="Masalan: 1234567"
                  icon="solar:card-2-linear"
                />
              </div>

              <div v-if="!isKindergarten" class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t dark:border-gray-700/50">
                <FormInput
                  v-model="form.passportNumber"
                  label="Pasport seriyasi va raqami (agar bo'lsa)"
                  placeholder="Masalan: AB 1234567"
                  icon="solar:card-linear"
                />
                <FormInput
                  v-model="form.pinfl"
                  label="JSHSHIR (PINFL - 14 xonali)"
                  placeholder="14 xonali JSHSHIR"
                  icon="solar:card-2-linear"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormInput
                v-model="form.phone"
                :label="isKindergarten ? 'Bog\'lanish telefoni' : 'Shaxsiy telefon raqami'"
                required
                placeholder="+998 90 123 45 67"
                icon="solar:phone-calling-linear"
              />
              <FormInput
                v-model="form.email"
                label="Email (ixtiyoriy)"
                type="email"
                placeholder="misol@gmail.com"
                icon="solar:letter-linear"
              />
            </div>
          </div>

          <!-- ========================================== -->
          <!-- STEP 2: OTA-ONA YOKI VASIY MA'LUMOTLARI     -->
          <!-- ========================================== -->
          <div v-show="currentStep === 2" class="space-y-3.5 animate-fade-in">
            <template v-if="isSchool || isKindergarten">
              <div class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Ota-ona yoki vasiy ma'lumotlari
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormInput
                  v-model="form.parentName"
                  label="Ota-onasi F.I.Sh"
                  required
                  placeholder="To'liq F.I.Sh kiriting"
                  icon="solar:user-hand-up-linear"
                />
                <FormSelect
                  v-model="form.parentKinship"
                  label="Qarindoshlik darajasi"
                  :options="[
                    { value: 'Otasi', label: 'Otasi' },
                    { value: 'Onasi', label: 'Onasi' },
                    { value: 'Vasiy', label: 'Vasiy / Homiy' },
                    { value: 'Bobosi', label: 'Bobosi' },
                    { value: 'Buvisi', label: 'Buvisi' },
                    { value: 'Boshqa', label: 'Boshqa qarindoshi' },
                  ]"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormInput
                  v-model="form.parentPhone"
                  label="Ota-onasi telefon raqami"
                  required
                  placeholder="+998 90 123 45 67"
                  icon="solar:phone-calling-linear"
                />
                <FormInput
                  v-model="form.parentWorkplace"
                  label="Ish joyi va lavozimi"
                  placeholder="Masalan: AloqaBank, Bosh mutaxassis"
                  icon="solar:case-linear"
                />
              </div>

              <!-- Ota-ona pasport ma'lumotlari -->
              <div class="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border dark:border-gray-700/60 space-y-3">
                <div class="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Icon icon="solar:shield-check-bold" class="text-indigo-600 text-base" />
                  <span>Ota-ona Pasport / ID-karta ma'lumotlari</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormInput
                    v-model="form.parentPassport"
                    label="Pasport seriyasi va raqami"
                    placeholder="AA 1234567"
                    icon="solar:card-linear"
                  />
                  <FormInput
                    v-model="form.parentPinfl"
                    label="JSHSHIR (PINFL)"
                    placeholder="14 xonali JSHSHIR"
                    icon="solar:card-2-linear"
                  />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormDatePicker
                    v-model="form.parentPassportDate"
                    label="Pasport berilgan sana"
                    placeholder="Sanani tanlang"
                  />
                  <FormInput
                    v-model="form.parentPassportGiven"
                    label="Pasport berilgan joyi"
                    placeholder="Masalan: Yunusobod IIB"
                  />
                </div>
              </div>
            </template>

            <!-- Course Center Course & Group selection -->
            <template v-else>
              <div class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Ta'lim kursi va Guruh
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormSelect
                  v-model="form.courseId"
                  label="Qabul qilinayotgan kurs"
                  required
                  :options="courseOptions"
                />
                <FormSelect
                  v-model="form.groupId"
                  label="Guruhga biriktirish"
                  :options="groupOptions"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormSelect
                  v-model="form.level"
                  label="Daraja"
                  :options="[
                    { value: 'BEGINNER', label: 'Boshlang\'ich (Beginner)' },
                    { value: 'ELEMENTARY', label: 'Elementary' },
                    { value: 'INTERMEDIATE', label: 'Intermediate' },
                    { value: 'ADVANCED', label: 'Advanced' },
                  ]"
                />
                <FormTimePicker
                  v-model="form.contactTime"
                  label="Qulay dars vaqti"
                  placeholder="Masalan: 14:00 - 18:00"
                />
              </div>

              <!-- Dars Kunlari Rejimi (2 Yonga / 2 Columns Layout) -->
              <div class="p-3.5 bg-gray-50 dark:bg-gray-900/40 rounded-xl border dark:border-gray-700/70">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <!-- Chap tomon: Presetlar -->
                  <div class="space-y-2">
                    <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Dars kunlari rejimi (Tezkor):
                    </label>
                    <div class="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        @click="setSchedulePreset('ODD')"
                        :class="[
                          'py-2 px-2 rounded-md text-xs font-medium border transition text-center cursor-pointer shadow-2xs',
                          isOddSchedule
                            ? 'bg-primary text-white border-primary ring-1 ring-primary'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-primary'
                        ]"
                      >
                        🔵 Toq kunlar (Du-Ch-Ju)
                      </button>
                      <button
                        type="button"
                        @click="setSchedulePreset('EVEN')"
                        :class="[
                          'py-2 px-2 rounded-md text-xs font-medium border transition text-center cursor-pointer shadow-2xs',
                          isEvenSchedule
                            ? 'bg-indigo-600 text-white border-indigo-600 ring-1 ring-indigo-600'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-indigo-600'
                        ]"
                      >
                        🟣 Juft kunlar (Se-Pa-Sh)
                      </button>
                      <button
                        type="button"
                        @click="setSchedulePreset('EVERYDAY')"
                        :class="[
                          'py-2 px-2 rounded-md text-xs font-medium border transition text-center cursor-pointer shadow-2xs',
                          isEverydaySchedule
                            ? 'bg-emerald-600 text-white border-emerald-600 ring-1 ring-emerald-600'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-emerald-600'
                        ]"
                      >
                        🟢 Har kuni (Du-Sh)
                      </button>
                      <button
                        type="button"
                        @click="setSchedulePreset('WEEKEND')"
                        :class="[
                          'py-2 px-2 rounded-md text-xs font-medium border transition text-center cursor-pointer shadow-2xs',
                          isWeekendSchedule
                            ? 'bg-amber-600 text-white border-amber-600 ring-1 ring-amber-600'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-amber-600'
                        ]"
                      >
                        🟡 Dam olish (Sh-Ya)
                      </button>
                    </div>
                  </div>

                  <!-- O'ng tomon: Alohida Kunlar Tanlovi -->
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Alohida kunlar tanlovi:
                      </label>
                      <span class="text-[11px] font-semibold text-primary truncate max-w-[130px]">
                        {{ form.studyDays.length ? form.studyDays.join(' • ') : 'Tanlanmagan' }}
                      </span>
                    </div>

                    <div class="flex flex-wrap gap-2 pt-1">
                      <label
                        v-for="day in ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']"
                        :key="day"
                        :class="[
                          'w-9 h-9 rounded-lg cursor-pointer border text-xs font-bold transition flex items-center justify-center select-none shadow-2xs',
                          form.studyDays.includes(day)
                            ? 'bg-primary text-white border-primary scale-105 ring-2 ring-primary/30'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        ]"
                      >
                        <input type="checkbox" :value="day" v-model="form.studyDays" class="hidden" />
                        <span>{{ day }}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- ========================================== -->
          <!-- STEP 3: SINF / GURUH VA YASHASH MANZILI    -->
          <!-- ========================================== -->
          <div v-show="currentStep === 3" class="space-y-3.5 animate-fade-in">
            <!-- 3.1 SCHOOL SPECIFICS -->
            <template v-if="isSchool">
              <div class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Sinf va Ta'lim Rejimi
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormSelect
                  v-model="form.schoolClass"
                  label="Qabul sinfi"
                  required
                  :options="schoolClassOptions"
                />
                <FormSelect
                  v-model="form.classLetter"
                  label="Paralel / Harf"
                  :options="[
                    { value: 'A', label: 'A sinf' },
                    { value: 'B', label: 'B sinf' },
                    { value: 'V', label: 'V sinf' },
                    { value: 'G', label: 'G sinf' },
                  ]"
                />
                <FormSelect
                  v-model="form.studyLanguage"
                  label="Ta'lim tili"
                  :options="[
                    { value: 'O\'zbek', label: 'O\'zbek tili' },
                    { value: 'Rus', label: 'Rus tili' },
                    { value: 'Ingliz', label: 'Ingliz tili' },
                  ]"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormSelect
                  v-model="form.teacherId"
                  label="Sinf rahbari"
                  :options="teacherOptions"
                />
                <FormSelect
                  v-model="form.schoolShift"
                  label="Smena / Dars tartibi"
                  :options="[
                    { value: '1-smena', label: '1-smena (08:30 - 13:30)' },
                    { value: 'FullDay', label: 'To\'liq kun (08:30 - 17:00)' },
                  ]"
                />
              </div>
            </template>

            <!-- 3.2 KINDERGARTEN SPECIFICS -->
            <template v-else-if="isKindergarten">
              <div class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Bog'cha guruhi va Parvarish
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormSelect
                  v-model="form.kindergartenGroup"
                  label="Yosh guruhi"
                  required
                  :options="kindergartenGroupOptions"
                />
                <FormSelect
                  v-model="form.attendanceSchedule"
                  label="Qatnashish tartibi"
                  :options="[
                    { value: 'FULL_DAY', label: 'To\'liq kun (08:00 - 18:00)' },
                    { value: 'HALF_DAY', label: 'Yarim kun (08:00 - 13:00)' },
                  ]"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormSelect
                  v-model="form.teacherId"
                  label="Mas'ul tarbiyachi"
                  :options="teacherOptions"
                />
                <FormInput
                  v-model="form.dietNotes"
                  label="Allergiya / Maxsus parhez"
                  placeholder="Masalan: Sut mahsulotlariga allergiyasi bor"
                  icon="solar:shield-warning-linear"
                />
              </div>
            </template>

            <!-- 3.3 YASHASH MANZILI (COMMON FOR ALL) -->
            <div class="pt-2 border-t dark:border-gray-700/60 space-y-3">
              <div class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Yashash manzili ma'lumotlari
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormSelect
                  v-model="form.region"
                  label="Viloyat"
                  :options="regionOptions"
                />
                <FormInput
                  v-model="form.city"
                  label="Tuman / Shahar"
                  placeholder="Masalan: Yunusobod tumani"
                />
              </div>

              <FormInput
                v-model="form.address"
                label="To'liq manzil"
                placeholder="Ko'cha, uy, xonadon raqami"
                icon="solar:map-point-linear"
              />
            </div>
          </div>

          <!-- ========================================== -->
          <!-- STEP 4: SHARTNOMA VA TO'LOV                -->
          <!-- ========================================== -->
          <div v-show="currentStep === 4" class="space-y-3.5 animate-fade-in">
            <div class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
              Shartnoma va To'lov ma'lumotlari
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormInput
                v-model="form.contractNumber"
                label="Shartnoma raqami"
                required
                icon="solar:document-text-linear"
              />
              <FormDatePicker
                v-model="form.enrolledDate"
                label="Shartnoma / Qabul sanasi"
                placeholder="Sanani tanlang"
              />
            </div>

            <!-- To'lov kartasi -->
            <div class="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 rounded-xl border-2 border-emerald-200 dark:border-emerald-800/60 space-y-3">
              <label class="flex items-center justify-between cursor-pointer select-none">
                <div class="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-200 font-bold text-sm">
                  <Icon icon="solar:wallet-money-bold" class="text-xl text-emerald-600" />
                  <span>{{ paymentCardTitle }}</span>
                </div>
                <input
                  type="checkbox"
                  v-model="form.enablePayment"
                  class="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </label>

              <div
                class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 transition-opacity"
                :class="{ 'opacity-60': !form.enablePayment }"
              >
                <FormCurrencyInput
                  v-model="form.initialPayment"
                  :label="isSchool ? 'Maktab oylik to\'lovi' : isKindergarten ? 'Bog\'cha oylik to\'lovi' : 'Kurs to\'lovi summasi'"
                  placeholder="Masalan: 3 200 000"
                  :disabled="!form.enablePayment"
                  :required="form.enablePayment"
                />
                <FormSelect
                  v-model="form.paymentMethod"
                  label="To'lov usuli"
                  :disabled="!form.enablePayment"
                  :options="[
                    { value: 'PAYME', label: 'Payme' },
                    { value: 'CLICK', label: 'Click' },
                    { value: 'CASH', label: 'Naqd pul' },
                    { value: 'CARD', label: 'Bank kartasi' },
                    { value: 'UZUM', label: 'Uzum Pay' },
                  ]"
                />
              </div>
            </div>

            <!-- Notes and comments -->
            <FormInput
              v-model="form.notes"
              label="Qo'shimcha izoh / Eslatma"
              placeholder="Masalan: 10% chegirma berildi, darslar dushanbadan boshlanadi..."
            />
          </div>
        </div>

        <!-- Modal Footer Navigation Buttons -->
        <div class="p-4 sm:px-6 border-t dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/80 flex items-center justify-between gap-3">
          <AppButton
            variant="outline"
            @click="close"
          >
            Bekor qilish
          </AppButton>

          <div class="flex items-center gap-2.5">
            <!-- Previous Step Button -->
            <AppButton
              v-if="currentStep > 1"
              variant="outline"
              icon="solar:arrow-left-linear"
              @click="prevStep"
            >
              Orqaga
            </AppButton>

            <!-- Next Step Button -->
            <AppButton
              v-if="currentStep < totalSteps"
              variant="primary"
              @click="nextStep"
            >
              <span>Keyingisi</span>
              <Icon icon="solar:arrow-right-linear" class="text-base ml-1" />
            </AppButton>

            <!-- Final Submit Button -->
            <AppButton
              v-else
              variant="success"
              icon="solar:check-circle-bold"
              :loading="saving"
              @click="submitWizard"
            >
              {{ saving ? 'Saqlanmoqda...' : 'Saqlash va Qabul Qilish' }}
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  </transition>
</Teleport>
</template>

<script>
import { Icon } from "@iconify/vue";
import AppButton from "@/components/AppButton.vue";
import FormInput from "@/components/FormInput.vue";
import FormSelect from "@/components/FormSelect.vue";
import FormDatePicker from "@/components/FormDatePicker.vue";
import FormCurrencyInput from "@/components/FormCurrencyInput.vue";
import FormTimePicker from "@/components/FormTimePicker.vue";
import { studentsApi, coursesApi, groupsApi, paymentsApi, leadsApi, usersApi } from "@/api/services";
import { useTenantStore } from "@/store/tenant";

export default {
  name: "StudentWizardModal",
  components: {
    AppButton,
    Icon,
    FormInput,
    FormSelect,
    FormDatePicker,
    FormCurrencyInput,
    FormTimePicker,
  },
  emits: ["close", "saved"],
  data() {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    return {
      isOpen: false,
      saving: false,
      currentStep: 1,
      totalSteps: 4,
      tenantStore: useTenantStore(),
      courses: [],
      groups: [],
      teachers: [],
      nationalityOptions: [
        { value: "O'zbek", label: "O'zbek" },
        { value: "Rus", label: "Rus" },
        { value: "Qoraqalpoq", label: "Qoraqalpoq" },
        { value: "Tojik", label: "Tojik" },
        { value: "Qozoq", label: "Qozoq" },
        { value: "Qirg'iz", label: "Qirg'iz" },
        { value: "Turkman", label: "Turkman" },
        { value: "Koreys", label: "Koreys" },
        { value: "Tatar", label: "Tatar" },
        { value: "Boshqa", label: "Boshqa" },
      ],
      regionOptions: [
        { value: "Toshkent shahri", label: "Toshkent shahri" },
        { value: "Toshkent viloyati", label: "Toshkent viloyati" },
        { value: "Samarqand viloyati", label: "Samarqand viloyati" },
        { value: "Farg'ona viloyati", label: "Farg'ona viloyati" },
        { value: "Andijon viloyati", label: "Andijon viloyati" },
        { value: "Namangan viloyati", label: "Namangan viloyati" },
        { value: "Buxoro viloyati", label: "Buxoro viloyati" },
        { value: "Xorazm viloyati", label: "Xorazm viloyati" },
        { value: "Qashqadaryo viloyati", label: "Qashqadaryo viloyati" },
        { value: "Surxondaryo viloyati", label: "Surxondaryo viloyati" },
        { value: "Navoiy viloyati", label: "Navoiy viloyati" },
        { value: "Jizzax viloyati", label: "Jizzax viloyati" },
        { value: "Sirdaryo viloyati", label: "Sirdaryo viloyati" },
        { value: "Qoraqalpog'iston Respublikasi", label: "Qoraqalpog'iston Respublikasi" },
      ],
      isExistingStudent: false,
      existingStudentId: null,
      existingPaymentId: null,
      existingPaymentAmount: null,
      form: {
        leadId: null,
        firstName: "",
        lastName: "",
        middleName: "",
        phone: "",
        email: "",
        birthDate: "2016-09-01",
        gender: "MALE",
        nationality: "O'zbek",
        enrolledDate: todayStr,
        status: "ACTIVE",
        // Hujjatlar
        certSeries: "I-TN",
        certNumber: "",
        passportNumber: "",
        pinfl: "",
        // Ota-ona ma'lumotlari
        parentName: "",
        parentKinship: "Otasi",
        parentPhone: "",
        parentWorkplace: "",
        parentPassport: "",
        parentPinfl: "",
        parentPassportDate: "",
        parentPassportGiven: "",
        // Yashash manzili
        region: "Toshkent shahri",
        city: "",
        address: "",
        // Ta'lim / Sinf / Bog'cha
        schoolClass: "1-sinf",
        classLetter: "A",
        studyLanguage: "O'zbek",
        schoolShift: "1-smena",
        teacherId: "",
        kindergartenGroup: "Mittivoylar guruhi (3-4 yosh)",
        attendanceSchedule: "FULL_DAY",
        dietNotes: "",
        courseId: "",
        groupId: "",
        level: "INTERMEDIATE",
        contactTime: "",
        studyDays: ["Du", "Ch", "Ju"],
        // Shartnoma va To'lov
        contractNumber: "",
        enablePayment: true,
        initialPayment: "",
        paymentMethod: "PAYME",
        notes: "",
      },
    };
  },
  computed: {
    isSchool() {
      return this.tenantStore.isSchool;
    },
    isKindergarten() {
      return this.tenantStore.isKindergarten;
    },
    isCourseCenter() {
      return this.tenantStore.isCourseCenter;
    },
    headerIcon() {
      if (this.isSchool) return "solar:buildings-3-bold";
      if (this.isKindergarten) return "solar:smile-circle-bold";
      return "ph:student-fill";
    },
    modalTitle() {
      if (this.isSchool) return "Maktabga O'quvchi Qabul Qilish";
      if (this.isKindergarten) return "Bog'chaga Bola Qabul Qilish";
      return "O'quv Markaziga O'quvchi Qabul Qilish";
    },
    paymentCardTitle() {
      if (this.isSchool) return "Maktab oylik to'lovini kassaga kiritish";
      if (this.isKindergarten) return "Bog'cha to'lovini kassaga kiritish";
      return "Boshlang'ich to'lovni kassaga kiritish";
    },
    dynamicSteps() {
      if (this.isSchool || this.isKindergarten) {
        return [
          { id: 1, title: this.isKindergarten ? "Bola va Hujjatlari" : "O'quvchi va Hujjatlari", shortTitle: "Shaxsiy & Hujjat" },
          { id: 2, title: "Ota-ona (Vasiy) ma'lumotlari", shortTitle: "Ota-ona / Vasiy" },
          { id: 3, title: this.isSchool ? "Sinf va Yashash manzili" : "Guruh va Yashash manzili", shortTitle: "Sinf / Manzil" },
          { id: 4, title: "Shartnoma va To'lov", shortTitle: "Shartnoma & To'lov" },
        ];
      }
      return [
        { id: 1, title: "Asosiy ma'lumotlar", shortTitle: "Asosiy" },
        { id: 2, title: "Ta'lim va Guruh", shortTitle: "Guruh & Dars" },
        { id: 3, title: "Ota-ona va Manzil", shortTitle: "Oila & Manzil" },
        { id: 4, title: "Shartnoma va To'lov", shortTitle: "To'lov" },
      ];
    },
    currentStepTitle() {
      return this.dynamicSteps[this.currentStep - 1]?.title || "";
    },
    isStep1Valid() {
      return Boolean(this.form.firstName && this.form.lastName && this.form.phone);
    },
    schoolClassOptions() {
      return [
        { value: "1-sinf", label: "1-sinf" },
        { value: "2-sinf", label: "2-sinf" },
        { value: "3-sinf", label: "3-sinf" },
        { value: "4-sinf", label: "4-sinf" },
        { value: "5-sinf", label: "5-sinf" },
        { value: "6-sinf", label: "6-sinf" },
        { value: "7-sinf", label: "7-sinf" },
        { value: "8-sinf", label: "8-sinf" },
        { value: "9-sinf", label: "9-sinf" },
        { value: "10-sinf", label: "10-sinf" },
        { value: "11-sinf", label: "11-sinf" },
      ];
    },
    kindergartenGroupOptions() {
      return [
        { value: "Kichkintoylar guruhi", label: "Kichkintoylar guruhi (2-3 yosh)" },
        { value: "Mittivoylar guruhi", label: "Mittivoylar guruhi (3-4 yosh)" },
        { value: "Bilimdonlar guruhi", label: "Bilimdonlar guruhi (4-5 yosh)" },
        { value: "Alpomishlar guruhi", label: "Alpomishlar guruhi (5-6 yosh)" },
        { value: "Maktabga tayyorlov guruhi", label: "Maktabga tayyorlov guruhi (6-7 yosh)" },
      ];
    },
    courseOptions() {
      return this.courses.map((c) => ({
        value: c.id,
        label: `${c.name || c.title}`,
      }));
    },
    groupOptions() {
      const courseId = this.form.courseId;
      const list = courseId ? this.groups.filter((g) => g.courseId === courseId || !g.courseId) : this.groups;
      return [
        { value: "", label: "Guruhsiz (Keyinroq biriktirish)" },
        ...list.map((g) => ({
          value: g.id,
          label: `${g.name || g.title} (${g.course?.name || 'Kurs'})`,
        })),
      ];
    },
    teacherOptions() {
      return this.teachers.map((t) => ({
        value: t.id,
        label: `${t.firstName} ${t.lastName}`,
      }));
    },
    isOddSchedule() {
      const s = this.form.studyDays;
      return s.length === 3 && s.includes("Du") && s.includes("Ch") && s.includes("Ju");
    },
    isEvenSchedule() {
      const s = this.form.studyDays;
      return s.length === 3 && s.includes("Se") && s.includes("Pa") && s.includes("Sh");
    },
    isEverydaySchedule() {
      return this.form.studyDays.length === 6;
    },
    isWeekendSchedule() {
      const s = this.form.studyDays;
      return s.length === 2 && s.includes("Sh") && s.includes("Ya");
    },
  },
  methods: {
    setSchedulePreset(type) {
      if (type === "ODD") {
        this.form.studyDays = ["Du", "Ch", "Ju"];
      } else if (type === "EVEN") {
        this.form.studyDays = ["Se", "Pa", "Sh"];
      } else if (type === "EVERYDAY") {
        this.form.studyDays = ["Du", "Se", "Ch", "Pa", "Ju", "Sh"];
      } else if (type === "WEEKEND") {
        this.form.studyDays = ["Sh", "Ya"];
      }
    },
    async open(initialData = null) {
      this.currentStep = 1;
      this.isOpen = true;
      this.isExistingStudent = false;
      this.existingStudentId = null;
      this.existingPaymentId = null;
      this.existingPaymentAmount = null;

      // Load references
      try {
        const [cRes, gRes, tRes] = await Promise.all([
          coursesApi.getAll().catch(() => []),
          groupsApi.getAll().catch(() => []),
          usersApi.getAll({ role: "TEACHER" }).catch(() => []),
        ]);
        this.courses = cRes || [];
        this.groups = gRes || [];
        this.teachers = tRes || [];
      } catch (e) {
        console.error(e);
      }

      if (initialData) {
        if (initialData.phone) {
          try {
            const sRes = await studentsApi.getAll({ search: initialData.phone });
            if (Array.isArray(sRes)) {
              const matched = sRes.find((s) => s.phone === initialData.phone);
              if (matched) {
                this.isExistingStudent = true;
                this.existingStudentId = matched.id;
                try {
                  const pRes = await paymentsApi.getAll({ studentId: matched.id });
                  if (Array.isArray(pRes) && pRes.length > 0) {
                    this.existingPaymentId = pRes[0].id;
                    this.existingPaymentAmount = pRes[0].amount;
                  }
                } catch (pErr) {
                  console.error("To'lovlarni tekshirishda xatolik:", pErr);
                }
              }
            }
          } catch (err) {
            console.error("Mavjud o'quvchini tekshirishda xatolik:", err);
          }
        }

        const nameParts = (initialData.fullName || "").trim().split(" ");
        const firstName = nameParts[0] || initialData.firstName || "";
        const lastName = nameParts[1] || initialData.lastName || "";
        const middleName = nameParts.slice(2).join(" ") || "";

        let defaultPay = initialData.amount;
        if (!defaultPay) {
          defaultPay = this.isSchool ? 3200000 : this.isKindergarten ? 1800000 : 850000;
        }

        this.form = {
          leadId: initialData.id || null,
          firstName,
          lastName,
          middleName,
          phone: initialData.phone || "",
          email: initialData.email || "",
          birthDate: this.isKindergarten ? "2021-05-15" : this.isSchool ? "2016-09-01" : "2004-01-01",
          gender: "MALE",
          nationality: "O'zbek",
          enrolledDate: this.form.enrolledDate,
          status: "ACTIVE",
          certSeries: "I-TN",
          certNumber: `${Math.floor(1000000 + Math.random() * 9000000)}`,
          passportNumber: "",
          pinfl: "",
          parentName: initialData.parentName || "",
          parentKinship: "Otasi",
          parentPhone: initialData.phone || "",
          parentWorkplace: "",
          parentPassport: "",
          parentPinfl: "",
          parentPassportDate: "",
          parentPassportGiven: "",
          region: "Toshkent shahri",
          city: "",
          address: initialData.address || "",
          schoolClass: initialData.courseName?.includes("sinf") ? initialData.courseName : "1-sinf",
          classLetter: "A",
          studyLanguage: "O'zbek",
          schoolShift: "1-smena",
          teacherId: this.teachers[0]?.id || "",
          kindergartenGroup: initialData.courseName?.includes("guruh") ? initialData.courseName : "Mittivoylar guruhi (3-4 yosh)",
          attendanceSchedule: "FULL_DAY",
          dietNotes: "",
          courseId: initialData.courseId || initialData.course?.id || this.courses[0]?.id || "",
          groupId: "",
          level: "INTERMEDIATE",
          contactTime: "14:00 - 16:00",
          studyDays: ["Du", "Ch", "Ju"],
          contractNumber: this.isSchool ? `MSH-${Date.now().toString().slice(-4)}` : this.isKindergarten ? `BSH-${Date.now().toString().slice(-4)}` : `SH-${Date.now().toString().slice(-4)}`,
          enablePayment: true,
          initialPayment: defaultPay,
          paymentMethod: "PAYME",
          notes: initialData.notes || "",
        };
      } else {
        this.form.leadId = null;
        this.form.firstName = "";
        this.form.lastName = "";
        this.form.middleName = "";
        this.form.phone = "";
        this.form.email = "";
        this.form.contractNumber = this.isSchool ? `MSH-${Date.now().toString().slice(-4)}` : this.isKindergarten ? `BSH-${Date.now().toString().slice(-4)}` : `SH-${Date.now().toString().slice(-4)}`;
        this.form.enablePayment = true;
        this.form.initialPayment = this.isSchool ? 3200000 : this.isKindergarten ? 1800000 : 850000;
      }
    },
    close() {
      this.isOpen = false;
      this.$emit("close");
    },
    goToStep(step) {
      if (step < 1 || step > 4) return;
      this.currentStep = step;
    },
    nextStep() {
      if (this.currentStep === 1) {
        if (!this.form.firstName.trim() || !this.form.lastName.trim() || !this.form.phone.trim()) {
          alert("Iltimos, ism, familiya va telefon raqamini to'ldiring!");
          return;
        }
      }
      if (this.currentStep < 4) {
        this.currentStep++;
      }
    },
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    async submitWizard() {
      this.saving = true;
      try {
        let fullNotes = this.form.notes || "";
        if (this.isSchool) {
          fullNotes = `Sinf: ${this.form.schoolClass} (${this.form.classLetter}). Til: ${this.form.studyLanguage}. Metrika: ${this.form.certSeries} ${this.form.certNumber}. Ota-ona: ${this.form.parentName} (${this.form.parentKinship}, ${this.form.parentPhone}). ` + fullNotes;
        } else if (this.isKindergarten) {
          fullNotes = `Guruh: ${this.form.kindergartenGroup}. Tartib: ${this.form.attendanceSchedule}. Metrika: ${this.form.certSeries} ${this.form.certNumber}. Parhez: ${this.form.dietNotes || 'Oddiy'}. Ota-ona: ${this.form.parentName} (${this.form.parentKinship}, ${this.form.parentPhone}). ` + fullNotes;
        }
        const safeNotes = fullNotes.trim() || undefined;

        const payload = {
          firstName: (this.form.firstName || "").trim(),
          lastName: (this.form.lastName || "").trim() || "—",
          phone: (this.form.phone || "").trim(),
          email: (this.form.email || "").trim() || undefined,
          passportNumber: (this.form.passportNumber || this.form.certNumber || "").trim() || undefined,
          pinfl: (this.form.pinfl || "").trim() || undefined,
          gender: this.form.gender || "MALE",
          status: this.form.status || "ACTIVE",
          level: this.form.level || undefined,
          contactTime: this.form.contactTime || undefined,
          studyDays: this.form.studyDays || [],
          contractNumber: (this.form.contractNumber || "").trim() || undefined,
          region: this.form.region || undefined,
          city: this.form.city || undefined,
          address: this.form.address || undefined,
          workplace: this.form.workplace || undefined,
          source: this.form.source || undefined,
          parentName: (this.form.parentName || "").trim() || undefined,
          parentPhone: (this.form.parentPhone || "").trim() || undefined,
          notes: safeNotes,
          initialGroupId: this.form.groupId || undefined,
        };

        let student = null;
        try {
          if (this.existingStudentId) {
            student = await studentsApi.update(this.existingStudentId, payload);
          } else {
            student = await studentsApi.create(payload);
          }
        } catch (apiErr) {
          console.warn("Backend API da saqlashda ogohlantirish, lokal saqlanmoqda:", apiErr);
          student = {
            id: this.existingStudentId || `student-${Date.now()}`,
            ...payload,
          };
        }

        // Persist enrolled student to local storage so Students page reflects it immediately
        try {
          let savedStudents = [];
          const rawS = localStorage.getItem("educrm_students_store");
          if (rawS) savedStudents = JSON.parse(rawS);

          const matchedGroup = this.groups.find((g) => g.id === this.form.groupId);
          const studentEntry = {
            id: student?.id || `student-${Date.now()}`,
            firstName: this.form.firstName,
            lastName: this.form.lastName || "",
            phone: this.form.phone,
            parentName: this.form.parentName || "",
            parentPhone: this.form.parentPhone || "",
            address: this.form.address || "",
            balance: Number(this.form.initialPayment) || 0,
            status: this.form.status || "ACTIVE",
            enrollments: matchedGroup ? [{ id: `en-${Date.now()}`, group: { name: matchedGroup.name || matchedGroup.title || 'Guruh' } }] : [],
            createdAt: new Date().toISOString(),
          };

          const sIdx = savedStudents.findIndex((s) => s.phone === this.form.phone || (student?.id && s.id === student.id));
          if (sIdx !== -1) {
            savedStudents[sIdx] = { ...savedStudents[sIdx], ...studentEntry };
          } else {
            savedStudents.unshift(studentEntry);
          }
          localStorage.setItem("educrm_students_store", JSON.stringify(savedStudents));
        } catch (e) {
          console.error("Local student storage error:", e);
        }

        if (this.form.groupId && student && student.id) {
          try {
            await groupsApi.addStudent(this.form.groupId, student.id);
          } catch (gErr) {
            console.error("Guruhga biriktirishda xatolik:", gErr);
          }
        }

        if (Number(this.form.initialPayment) > 0 && student && student.id) {
          try {
            const payAmount = Number(this.form.initialPayment);
            if (this.existingPaymentId) {
              await paymentsApi.update(this.existingPaymentId, {
                amount: payAmount,
                method: this.form.paymentMethod || "PAYME",
              }).catch(() => {});
            } else {
              await paymentsApi.create({
                studentId: student.id,
                amount: payAmount,
                method: this.form.paymentMethod || "PAYME",
                status: "PAID",
                notes: this.isSchool ? "Maktab boshlang'ich oylik to'lovi" : this.isKindergarten ? "Bog'cha oylik to'lovi" : "O'quv kursi to'lovi",
              }).catch(() => {});
            }
          } catch (payErr) {
            console.error("To'lovni saqlashda xatolik:", payErr);
          }
        }

        const paymentAmount = (this.form.initialPayment !== undefined && this.form.initialPayment !== null && this.form.initialPayment !== "")
          ? Number(this.form.initialPayment)
          : undefined;

        if (this.form.leadId) {
          try {
            await leadsApi.update(this.form.leadId, {
              status: "ENROLLED",
              amount: paymentAmount,
            }).catch(() => {});

            // Also update persistent leads store for all types
            const types = ["COURSE_CENTER", "SCHOOL", "KINDERGARTEN"];
            for (const t of types) {
              const storageKey = `educrm_leads_store_${t}`;
              const raw = localStorage.getItem(storageKey);
              if (raw) {
                const leads = JSON.parse(raw);
                const idx = leads.findIndex((l) => String(l.id) === String(this.form.leadId));
                if (idx !== -1) {
                  const fullName = `${this.form.firstName || ""} ${this.form.lastName || ""}`.trim();
                  leads[idx].status = "ENROLLED";
                  leads[idx].stage = "ENROLLED";
                  if (paymentAmount !== undefined) {
                    leads[idx].amount = paymentAmount;
                  }
                  if (fullName) leads[idx].fullName = fullName;
                  if (this.form.firstName) leads[idx].firstName = this.form.firstName;
                  if (this.form.lastName) leads[idx].lastName = this.form.lastName;
                  if (this.form.phone) leads[idx].phone = this.form.phone;
                  if (this.form.parentName) leads[idx].parentName = this.form.parentName;
                  if (this.form.parentPhone) leads[idx].parentPhone = this.form.parentPhone;
                  if (this.form.address) leads[idx].address = this.form.address;

                  if (this.isSchool) {
                    leads[idx].courseName = `${this.form.schoolClass} (${this.form.studyLanguage || "O'zbek"})`;
                  } else if (this.isKindergarten) {
                    leads[idx].courseName = `${this.form.kindergartenGroup}`;
                  } else if (this.form.courseId) {
                    const courseObj = this.courses.find((c) => c.id === this.form.courseId);
                    if (courseObj) {
                      leads[idx].courseName = courseObj.name || courseObj.title;
                      leads[idx].courseId = this.form.courseId;
                    }
                  }

                  localStorage.setItem(storageKey, JSON.stringify(leads));
                }
              }
            }
          } catch (lErr) {
            console.error("Lid statusini yangilashda xatolik:", lErr);
          }
        }

        this.$emit("saved", {
          ...(student || { firstName: this.form.firstName, lastName: this.form.lastName }),
          leadId: this.form.leadId,
          phone: this.form.phone,
          amount: paymentAmount,
          initialPayment: paymentAmount,
        });
        this.close();
      } catch (err) {
        console.error("Wizardda xatolik:", err);
        const paymentAmount = (this.form.initialPayment !== undefined && this.form.initialPayment !== null && this.form.initialPayment !== "")
          ? Number(this.form.initialPayment)
          : undefined;
        this.$emit("saved", {
          firstName: this.form.firstName,
          lastName: this.form.lastName,
          leadId: this.form.leadId,
          phone: this.form.phone,
          amount: paymentAmount,
          initialPayment: paymentAmount,
        });
        this.close();
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>
