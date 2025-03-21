<script setup lang="ts">
import TextInput from "@/components/forms/TextInput.vue";
import {useForm} from "vee-validate";
import {toTypedSchema} from "@vee-validate/yup";
import * as yup from "yup";
import {inject, ref} from "vue";
import axios, {type AxiosInstance} from "axios";
import {useRouter} from "vue-router";
import Icon from "@/components/icon.vue";

const http = inject<AxiosInstance>("axios", axios.create());
const loading = ref(false);

const { errors, defineField, setErrors, validate } = useForm({
  validationSchema: toTypedSchema(
      yup.object({
        username: yup
            .string()
            .required("Username is required")
            .min(3, "Username must be at least 3 characters"),
        email: yup
            .string()
            .email("Enter a valid email")
            .required("Email is required"),
        password: yup
            .string()
            .required("Password is required")
            .min(8, "Password must be at least 8 characters")
            .matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/gm, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
        confirmPassword: yup
            .string()
            .required("Confirm password is required")
            .oneOf([yup.ref("password")], "Passwords must match")
      })
  )
});

const [username, usernameAttrs] = defineField("username");
const [email, emailAttrs] = defineField("email");
const [password, passwordAttrs] = defineField("password");
const [confirmPassword, confirmPasswordAttrs] = defineField("confirmPassword");

const router = useRouter();

const handleRegister = async () => {
  const validation = await validate();

  if (!validation.valid) {
    return;
  }

  loading.value = true;

  try {
    await http.post("/auth/register", {
      username: username.value,
      email: email.value,
      password: password.value
    }, {
      withCredentials: true
    });

    await router.push({ name: 'register-confirm' })
  } catch (e: any) {
    console.error("Failed to register user");

    switch (e.response.status) {
      case 400:
        for (const [key, value] of Object.entries(e.response.data.errors)) {
          if (typeof value === "string") {
            setErrors({ [key]: value });
          } else if (Array.isArray(value)) {
            setErrors({ [key]: value[0] });
          }
        }
        break;
      case 409:
        setErrors({ email: "Email already in use" });
        break
    }
  }

  loading.value = false;
}
</script>

<template>
  <div>
    <div class="text-center">
      <p class="text">Already have an account? <RouterLink class="btn btn-link btn-sm px-0" :to="{ name: 'login' }">Login here</RouterLink></p>
    </div>
    <form @submit.prevent="handleRegister">
      <div class="flex flex-col gap-4">
        <TextInput v-model="username" name="username" placeholder="Username" autocomplete="username" :error="errors.username">
          <template #icon-prepend>
            <Icon name="person" />
          </template>
        </TextInput>
        <TextInput v-model="email" name="email" placeholder="Email" autocomplete="email" :error="errors.email">
          <template #icon-prepend>
            <Icon name="mail" />
          </template>
        </TextInput>
        <TextInput v-model="password" name="password" placeholder="Password" type="password" autocomplete="password" :error="errors.password">
          <template #icon-prepend>
            <Icon name="lock" />
          </template>
        </TextInput>
        <TextInput v-model="confirmPassword" name="confirmPassword" placeholder="Confirm password" type="password" autocomplete="password" :error="errors.confirmPassword">
          <template #icon-prepend>
            <Icon name="lock" />
          </template>
        </TextInput>
        <div class="flex justify-center">
          <button :disabled="loading" type="submit" class="btn btn-primary btn-wide transition-all">
            Register
            <span v-if="loading" class="loading loading-dots" />
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>

</style>