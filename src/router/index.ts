import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from "@/views/auth/LoginView.vue";
import RegisterView from "@/views/auth/RegisterView.vue";
import {useUserStore} from "@/stores/userStore";
import {useGroupsStore} from "@/stores/groupsStore";
import GroupView from "@/views/groups/GroupView.vue";
import NotFoundView from "@/views/NotFoundView.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
            meta: {
                bypassAuth: true
            }
        },
        {
            path: '/auth/google/callback',
            name: 'google-callback',
            component: () => import('../views/auth/GoogleCallbackView.vue'),
            meta: {
                bypassAuth: true
            }
        },
        {
            path: '/auth/google/link',
            name: 'google-link',
            component: () => import('../views/auth/GoogleLinkCallbackView.vue'),
            meta: {
                bypassAuth: true
            }
        },
        {
            path: '/auth/register-confirm',
            name: 'register-confirm',
            component: () => import('../views/auth/RegisterConfirmationView.vue'),
            meta: {
                bypassAuth: true
            }
        },
        {
            path: '/auth/confirm-email',
            name: 'email-confirm',
            component: () => import('../views/auth/EmailConfirmView.vue'),
            meta: {
                bypassAuth: true
            }
        },
        {
            path: '/account',
            name: 'account',
            component: () => import('../views/AccountView.vue')
        },
        {
            path: '/auth/reset-password',
            children: [
                {
                    path: '',
                    name: 'reset-password',
                    component: () => import('../views/auth/ResetPasswordView.vue')
                },
                {
                    path: 'confirm',
                    name: 'reset-password-confirm',
                    component: () => import('../views/auth/PasswordResetConfirmationView.vue')
                },
                {
                    path: 'request',
                    name: 'reset-password-request',
                    component: () => import('../views/auth/RequestPasswordResetView.vue')
                }
            ],
            meta: {
                bypassAuth: true
            }
        },
        {
            path: '/auth/link-google-account',
            name: 'link-google-account',
            component: () => import('../views/auth/LinkAccountView.vue'),
            meta: {
                bypassAuth: true
            }
        },
        {
            path: '/auth/complete-google-account',
            name: 'complete-google-account',
            component: () => import('../views/auth/FinishAccountSetupView.vue'),
            meta: {
                bypassAuth: true
            }
        },
        {
            path: '/auth',
            name: 'auth',
            component: () => import('../views/AuthView.vue'),
            meta: {
                bypassAuth: true
            },
            children: [
                {
                    path: 'login',
                    name: 'login',
                    component: LoginView
                },
                {
                    path: 'register',
                    name: 'register',
                    component: RegisterView
                }
            ]
        },
        {
            path: '/groups',
            name: 'groups',
            component: () => import('../views/groups/GroupsView.vue')
        },
        {
            path: '/groups/create',
            name: 'group-create',
            component: () => import('../views/groups/CreateGroupView.vue')
        },
        {
            path: '/group/:id',
            children: [
                {
                    path: '',
                    name: 'group',
                    component: GroupView
                },
                {
                    path: 'manage',
                    name: 'group-manage',
                   component: () => import('../views/groups/GroupManageView.vue'),
                    meta: {
                        validateGroupOwner: true
                    }
                },
                {
                    path: 'merge',
                    name: 'group-save-merge',
                    component: () => import('../views/groups/SaveMergeView.vue'),
                },
                {
                    path: 'upload',
                    name: 'group-save-upload',
                    component: () => import('../views/groups/SaveUploadView.vue'),
                    meta: {
                        validateGroupOwner: true
                    }
                }
            ],
        },
        {
            path: '/privacy',
            name: 'privacy',
            component: () => import('../views/PrivacyView.vue'),
            meta: {
                bypassAuth: true
            }
        },
        {
            path: '/terms-of-use',
            name: 'tos',
            component: () => import('../views/TosView.vue'),
            meta: {
                bypassAuth: true
            }
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: NotFoundView,
            meta: {
                bypassAuth: true
            }
        }
    ]
})


router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore();

    if (!to.meta.bypassAuth) {
        if (!userStore.accessTokenExpires || userStore.accessTokenExpires < new Date()) {
            await userStore.refreshToken();
        }

        if (!userStore.isAuthenticated) {
            next({ name: 'login' });
        }
    }

    if (to.meta.validateGroupOwner) {
        const groupId = to.params.id as string;
        const groupsStore = useGroupsStore();

        if (!groupsStore.isGroupOwner(groupId)) {
            next({ name: 'group', params: { id: groupId } });
        }
    }

    next();
})


export default router
