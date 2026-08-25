// /* eslint-disable @next/next/no-img-element */
'use client';
import { AppMenuItem } from "@/types";
import AppMenuitem from "./AppMenuitem";
import { MenuProvider } from "./context/menucontext";
import { useEffect, useMemo, useState } from "react";
import { getUserFromStorage } from "@/app/api/auth/authService";

// import React, { useContext } from 'react';
// import AppMenuitem from './AppMenuitem';
// import { LayoutContext } from './context/layoutcontext';
// import { MenuProvider } from './context/menucontext';
// import Link from 'next/link';
// import { AppMenuItem } from '@/types';

// const AppMenu = () => {
//     const { layoutConfig } = useContext(LayoutContext);

//     const model: AppMenuItem[] = [
//         {
//             label: 'Dashboard',
//             items: [{ label: 'Default', icon: 'pi pi-fw pi-home', to: '/dash' }]
//         },
//         {
//             label: 'Gestão de usuários',
//             icon: 'pi pi-fw pi-briefcase',
//             to: '/pages',
//             items: [
//                 {
//                     label: 'Clientes',
//                     icon: 'pi pi-fw pi-users',
//                     items: [
//                         {
//                             label: 'Dashboard',
//                             icon: 'pi pi-fw pi-chart-bar',
//                             to: '/pages/users/clients/dashboard'
//                         },
//                         {
//                             label: 'Lista',
//                             icon: 'pi pi-fw pi-bars',
//                             to: '/pages/users/clients/list'
//                         },

//                     ]
//                 },
//                 {
//                     label: 'Freelancers',
//                     icon: 'pi pi-fw pi-users',
//                     items: [
//                         {
//                             label: 'Dashboard',
//                             icon: 'pi pi-fw pi-chart-bar',
//                             to: '/pages/users/freelancer/dashboard'
//                         },
//                         {
//                             label: 'Lista',
//                             icon: 'pi pi-fw pi-bars',
//                             to: '/pages/users/freelancer/list'
//                         },

//                     ]
//                 },

//                 {
//                     label: 'Configurações',
//                     icon: 'pi pi-fw pi-cog',
//                     items: [
//                         {
//                             label: 'Roles',
//                             icon: 'pi pi-fw pi-paperclip',
//                             to: '/pages/config/roles'
//                         },
//                         {
//                             label: 'Permissões',
//                             icon: 'pi pi-fw pi-key',
//                             to: '/pages/config/permissions'
//                         },

//                     ]
//                 },
//                 {
//                     label: 'Crud',
//                     icon: 'pi pi-fw pi-pencil',
//                     to: '/pages/crud'
//                 },
//                 // {
//                 //     label: 'Timeline',
//                 //     icon: 'pi pi-fw pi-calendar',
//                 //     to: '/pages/timeline'
//                 // },
//                 // {
//                 //     label: 'Not Found',
//                 //     icon: 'pi pi-fw pi-exclamation-circle',
//                 //     to: '/pages/notfound'
//                 // },
//                 // {
//                 //     label: 'Empty',
//                 //     icon: 'pi pi-fw pi-circle-off',
//                 //     to: '/pages/empty'
//                 // }
//             ]
//         },
//         {
//             label: 'Serviços',
//             icon: 'pi pi-fw pi-briefcase',
//             to: '/pages',
//             items: [
//                 {
//                     label: 'Dashboard',
//                     icon: 'pi pi-fw pi-chart-bar',
//                     to: '/pages/services/dashboard'
//                 },
//                 {
//                     label: 'Serviços',
//                     icon: 'pi pi-fw pi-briefcase',
//                     to: '/pages/services/list'
//                 },
//                 {
//                     label: 'Categoria',
//                     icon: 'pi pi-fw pi-sliders-h',
//                     to: '/pages/services/category'
//                 },
//                 // {
//                 //     label: 'Novo',
//                 //     icon: 'pi pi-fw pi-plus',
//                 //     to: '/pages/services/new'
//                 // },
//             ]
//         },

//     ];

//     return (
//         <MenuProvider>
//             <ul className="layout-menu">
//                 {model.map((item, i) => {
//                     return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
//                 })}


//             </ul>
//         </MenuProvider>
//     );
// };

// export default AppMenu;
/* eslint-disable @next/next/no-img-element */

// import React, { useContext } from 'react';
// import AppMenuitem from './AppMenuitem';
// import { LayoutContext } from './context/layoutcontext';
// import { MenuProvider } from './context/menucontext';
// import { AppMenuItem } from '@/types';

// const AppMenu = () => {
//     const { layoutConfig } = useContext(LayoutContext);

//     const model: AppMenuItem[] = [
//         // =========================================================
//         // 1. PAINEL GERAL
//         // =========================================================
//         {
//             label: 'Painel Geral',
//             items: [
//                 {
//                     label: 'Dashboard',
//                     icon: 'pi pi-fw pi-home',
//                     to: '/dashboard'
//                 },
//                 {
//                     label: 'Meu Perfil',
//                     icon: 'pi pi-fw pi-user',
//                     to: '/pages/profile'
//                 }
//             ]
//         },

//         // =========================================================
//         // 2. SUBMISSÃO E APROVAÇÃO DE PRÉ-PROJECTOS
//         // =========================================================
//         {
//             label: 'Pré-Projectos',
//             icon: 'pi pi-fw pi-file',
//             items: [
//                 {
//                     label: 'Submeter Pré-Projecto',
//                     icon: 'pi pi-fw pi-upload',
//                     to: '/pre-projectos/submeter'
//                 },
//                 {
//                     label: 'Gestão de Pré-Projectos',
//                     icon: 'pi pi-fw pi-list',
//                     to: '/pre-projectos/gestao'
//                 },
//                 {
//                     label: 'Avaliação de Pré-Projecto',
//                     icon: 'pi pi-fw pi-check-square',
//                     to: '/pre-projectos/avaliacao'
//                 }
//             ]
//         },

//         // =========================================================
//         // 3. CADERNO DE ORIENTAÇÕES
//         // =========================================================
//         {
//             label: 'Caderno de Orientações',
//             icon: 'pi pi-fw pi-book',
//             items: [
//                 {
//                     label: 'Painel do Caderno',
//                     icon: 'pi pi-fw pi-chart-bar',
//                     to: '/orientacoes/dashboard'
//                 },
//                 {
//                     label: 'Sessões e Tarefas',
//                     icon: 'pi pi-fw pi-calendar',
//                     to: '/orientacoes/sessoes'
//                 }
//             ]
//         },

//         // =========================================================
//         // 4. ARTIGO CIENTÍFICO
//         // =========================================================
//         {
//             label: 'Artigo Científico',
//             icon: 'pi pi-fw pi-file-edit',
//             items: [
//                 {
//                     label: 'Editor IMRaD',
//                     icon: 'pi pi-fw pi-pencil',
//                     to: '/artigo/editor'
//                 }
//             ]
//         },

//         // =========================================================
//         // 5. CALENDÁRIO DE DEFESAS
//         // =========================================================
//         {
//             label: 'Defesas Públicas',
//             icon: 'pi pi-fw pi-calendar',
//             items: [
//                 {
//                     label: 'Agendar Defesa',
//                     icon: 'pi pi-fw pi-plus-circle',
//                     to: '/defesas/agendar'
//                 },
//                 {
//                     label: 'Calendário de Defesas',
//                     icon: 'pi pi-fw pi-calendar-times',
//                     to: '/defesas/calendario'
//                 }
//             ]
//         },

//         // =========================================================
//         // 6. FICHA DE AVALIAÇÃO E ACTA
//         // =========================================================
//         {
//             label: 'Avaliação e Acta',
//             icon: 'pi pi-fw pi-file-check',
//             items: [
//                 {
//                     label: 'Ficha de Avaliação',
//                     icon: 'pi pi-fw pi-check-square',
//                     to: '/avaliacao/ficha'
//                 },
//                 {
//                     label: 'Acta de Defesa',
//                     icon: 'pi pi-fw pi-file-pdf',
//                     to: '/avaliacao/acta'
//                 }
//             ]
//         }
//     ];

//     return (
//         <MenuProvider>
//             <ul className="layout-menu">
//                 {model.map((item, i) => {
//                     return !item?.seperator ? (
//                         <AppMenuitem
//                             item={item}
//                             root={true}
//                             index={i}
//                             key={item.label}
//                         />
//                     ) : (
//                         <li
//                             className="menu-separator"
//                             key={`separator-${i}`}
//                         />
//                     );
//                 })}
//             </ul>
//         </MenuProvider>
//     );
// };

// export default AppMenu;


// interface AppMenuItemWithRoles extends AppMenuItem {
//     roles?: string[];
//     items?: AppMenuItemWithRoles[];
// }

// const AppMenu = () => {
//     const [userRoles, setUserRoles] = useState<string[]>([]);

//     useEffect(() => {
//         const user = getUserFromStorage();

//         console.log("DADOS DO STORAGE:", user);

//         const roles: string[] = user?.data?.user?.roles || [];

//         console.log("ROLES:", roles);

//         setUserRoles(roles);
//     }, []);

//     const model: AppMenuItemWithRoles[] = [
//         // 1. PAINEL GERAL
//         {
//             label: 'Painel Geral',
//             roles: ['ADMIN', 'ESTUDANTE', 'ORIENTADOR', 'AVALIADOR_PRE_PROJECTO', 'PRESIDENTE_JURI', 'OPONENTE', 'COORDENADOR_TCC', 'CHEFE_DEPARTAMENTO'],
//             items: [
//                 {
//                     label: 'Dashboard',
//                     icon: 'pi pi-fw pi-home',
//                     to: '/dash',
//                     roles: ['ADMIN','AVALIADOR_PRE_PROJECTO', 'PRESIDENTE_JURI', 'OPONENTE', 'COORDENADOR_TCC', 'CHEFE_DEPARTAMENTO']
//                 },
//                   {
//                     label: 'Dashboard',
//                     icon: 'pi pi-fw pi-home',
//                     to: '/dash/student',
//                     roles: ['ESTUDANTE', 'ORIENTADOR', 'AVALIADOR_PRE_PROJECTO', 'PRESIDENTE_JURI', 'OPONENTE', 'COORDENADOR_TCC', 'CHEFE_DEPARTAMENTO']
//                 },
//                  {
//                     label: 'Dashboard',
//                     icon: 'pi pi-fw pi-home',
//                     to: '/dash/prof',
//                     roles: ['ORIENTADOR']
//                 },
//                 // {
//                 //     label: 'Meu Perfil',
//                 //     icon: 'pi pi-fw pi-user',
//                 //     to: '/pages/profile',
//                 //     roles: ['ADMIN', 'ESTUDANTE', 'ORIENTADOR', 'AVALIADOR_PRE_PROJECTO', 'PRESIDENTE_JURI', 'OPONENTE', 'COORDENADOR_TCC', 'CHEFE_DEPARTAMENTO']
//                 // }
//             ]
//         },

//         // 2. SUBMISSÃO E APROVAÇÃO DE PRÉ-PROJECTOS
//         {
//             label: 'Pré-Projectos',
//             icon: 'pi pi-fw pi-file',
//             roles: ['ADMIN','AVALIADOR_PRE_PROJECTO', 'COORDENADOR_TCC', 'CHEFE_DEPARTAMENTO'],
//             items: [
//                 {
//                     label: 'Submeter Pré-Projecto',
//                     icon: 'pi pi-fw pi-upload',
//                     to: '/pages/preProject/submitPreProject',
//                     roles: ['ADMIN', 'ESTUDANTE']
//                 },
//                 {
//                     label: 'Gestão de Pré-Projectos',
//                     icon: 'pi pi-fw pi-list',
//                     to: '/pages/preProject/gestao',
//                     roles: ['ADMIN', 'COORDENADOR_TCC', 'CHEFE_DEPARTAMENTO']
//                 },
//                 // {
//                 //     label: 'Avaliação de Pré-Projecto',
//                 //     icon: 'pi pi-fw pi-check-square',
//                 //     to: 'pages/preProject/projectEvaluation',
//                 //     roles: ['ADMIN', 'AVALIADOR_PRE_PROJECTO']
//                 // }
//             ]
//         },

//         // 3. CADERNO DE ORIENTAÇÕES
//         {
//             label: 'Caderno de Orientações',
//             icon: 'pi pi-fw pi-book',
//             roles: ['ADMIN', 'ESTUDANTE', 'ORIENTADOR', 'COORDENADOR_TCC'],
//             items: [
//                 {
//                     label: 'Sessões',
//                     icon: 'pi pi-fw pi-chart-bar',
//                     to: '/pages/book/evaluation',
//                     roles: ['ADMIN', 'ESTUDANTE', 'ORIENTADOR', 'COORDENADOR_TCC']
//                 },
//                 // {
//                 //     label: 'Sessões e Tarefas',
//                 //     icon: 'pi pi-fw pi-calendar',
//                 //     to: '/orientacoes/sessoes',
//                 //     roles: ['ADMIN', 'ESTUDANTE', 'ORIENTADOR']
//                 // }
//             ]
//         },

//         // 4. ARTIGO CIENTÍFICO
//         {
//             label: 'Artigo Científico',
//             icon: 'pi pi-fw pi-file-edit',
//             roles: ['ADMIN', 'ESTUDANTE', 'ORIENTADOR'],
//             items: [
//                 {
//                     label: 'Editor IMRaD',
//                     icon: 'pi pi-fw pi-pencil',
//                     to: '/pages/article',
//                     roles: ['ADMIN', 'ESTUDANTE', 'ORIENTADOR']
//                 }
//             ]
//         },

//         // 5. CALENDÁRIO DE DEFESAS
//         {
//             label: 'Defesas Públicas',
//             icon: 'pi pi-fw pi-calendar',
//             roles: ['ADMIN', 'ESTUDANTE', 'ORIENTADOR', 'PRESIDENTE_JURI', 'OPONENTE', 'COORDENADOR_TCC'],
//             items: [
//                 {
//                     label: 'Agendar Defesa',
//                     icon: 'pi pi-fw pi-plus-circle',
//                     to: '/pages/defense/schedule',
//                     roles: ['ADMIN', 'COORDENADOR_TCC']
//                 },
//                 {
//                     label: 'Calendário de Defesas',
//                     icon: 'pi pi-fw pi-calendar-times',
//                     to: '/pages/defense/calendar',
//                     roles: ['ADMIN', 'ESTUDANTE', 'ORIENTADOR', 'PRESIDENTE_JURI', 'OPONENTE', 'COORDENADOR_TCC']
//                 }
//             ]
//         },

//         // 6. FICHA DE AVALIAÇÃO E ACTA
//         {
//             label: 'Avaliação e Acta',
//             icon: 'pi pi-fw pi-file-check',
//             roles: ['ADMIN', 'PRESIDENTE_JURI', 'OPONENTE', 'ORIENTADOR', 'COORDENADOR_TCC'],
//             items: [
//                 {
//                     label: 'Ficha de Avaliação',
//                     icon: 'pi pi-fw pi-check-square',
//                     to: '/pages/minutes/form',
//                     roles: ['ADMIN', 'PRESIDENTE_JURI', 'OPONENTE', 'ORIENTADOR']
//                 },
//                 {
//                     label: 'Acta de Defesa',
//                     icon: 'pi pi-fw pi-file-pdf',
//                     to: '/pages/minutes',
//                     roles: ['ADMIN', 'PRESIDENTE_JURI', 'COORDENADOR_TCC']
//                 }
//             ]
//         }
//     ];

//     // Função de filtro por role
//     const filterMenuByRole = (items: AppMenuItemWithRoles[]): AppMenuItemWithRoles[] => {
//         return items
//             .filter((item) => {
//                 if (!item.roles) return true;
//                 return item.roles.some((role) => userRoles.includes(role));
//             })
//             .map((item) => {
//                 if (item.items) {
//                     return {
//                         ...item,
//                         items: filterMenuByRole(item.items)
//                     };
//                 }
//                 return item;
//             })
//             .filter((item) => !item.items || item.items.length > 0);
//     };

//     const filteredModel = filterMenuByRole(model);

//     return (
//         <MenuProvider>
//             <ul className="layout-menu">
//                 {filteredModel.map((item, i) => {
//                     return !item?.seperator ? (
//                         <AppMenuitem
//                             item={item}
//                             root={true}
//                             index={i}
//                             key={item.label}
//                         />
//                     ) : (
//                         <li
//                             className="menu-separator"
//                             key={`separator-${i}`}
//                         />
//                     );
//                 })}
//             </ul>
//         </MenuProvider>
//     );
// };

// export default AppMenu;

interface AppMenuItemWithRoles extends AppMenuItem {
    roles?: string[];
    items?: AppMenuItemWithRoles[];
}

/**
 * =========================================================
 * MENU PRINCIPAL
 * =========================================================
 *
 * O model fica fora do componente para evitar que seja
 * recriado a cada renderização do AppMenu.
 */
const model: AppMenuItemWithRoles[] = [
    // =====================================================
    // 1. PAINEL GERAL
    // =====================================================
    {
        label: 'Painel Geral',
        icon: 'pi pi-fw pi-home',

        roles: [
            'ADMIN',
            'ESTUDANTE',
            'ORIENTADOR',
            'AVALIADOR_PRE_PROJECTO',
            'PRESIDENTE_JURI',
            'OPONENTE',
            'COORDENADOR_TCC',
            'CHEFE_DEPARTAMENTO'
        ],

        items: [
            {
                label: 'Dashboard',
                icon: 'pi pi-fw pi-home',
                to: '/dash',

                roles: [
                    'ADMIN',
                    'AVALIADOR_PRE_PROJECTO',
                    'PRESIDENTE_JURI',
                    'OPONENTE',
                    'COORDENADOR_TCC',
                    'CHEFE_DEPARTAMENTO'
                ]
            },

            {
                label: 'Dashboard',
                icon: 'pi pi-fw pi-home',
                to: '/dash/student',

                roles: [
                    'ESTUDANTE',
                    'ORIENTADOR',
                    'AVALIADOR_PRE_PROJECTO',
                    'PRESIDENTE_JURI',
                    'OPONENTE',
                    'COORDENADOR_TCC',
                    'CHEFE_DEPARTAMENTO'
                ]
            },

            {
                label: 'Dashboard',
                icon: 'pi pi-fw pi-home',
                to: '/dash/prof',

                roles: [
                    'ORIENTADOR'
                ]
            }
        ]
    },

    // =====================================================
    // 2. SUBMISSÃO E APROVAÇÃO DE PRÉ-PROJECTOS
    // =====================================================
    {
        label: 'Pré-Projectos',
        icon: 'pi pi-fw pi-file',

        roles: [
            'ADMIN',
            'AVALIADOR_PRE_PROJECTO',
            'COORDENADOR_TCC',
            'CHEFE_DEPARTAMENTO'
        ],

        items: [
            {
                label: 'Submeter',
                icon: 'pi pi-fw pi-upload',
                to: '/pages/preProject/submitPreProject',

                roles: [
                    'ADMIN',
                    'ESTUDANTE'
                ]
            },

            {
                label: 'Gestão',
                icon: 'pi pi-fw pi-list',
                to: '/pages/preProject/gestao',

                roles: [
                    'ADMIN',
                    'COORDENADOR_TCC',
                    'CHEFE_DEPARTAMENTO'
                ]
            },

            {
                label: 'Avaliação',
                icon: 'pi pi-fw pi-check-square',
                to: '/pages/preProject/projectEvaluation',

                roles: [
                    'ADMIN',
                    'AVALIADOR_PRE_PROJECTO'
                ]
            }
        ]
    },

    // =====================================================
    // 3. CADERNO DE ORIENTAÇÕES
    // =====================================================
    {
        label: 'Caderno de Orientações',
        icon: 'pi pi-fw pi-book',

        roles: [
            'ADMIN',
            'ESTUDANTE',
            'ORIENTADOR',
            'COORDENADOR_TCC'
        ],

        items: [
            {
                label: 'Sessões',
                icon: 'pi pi-fw pi-chart-bar',
                to: '/pages/book/evaluation',

                roles: [
                    'ADMIN',
                    'ESTUDANTE',
                    'ORIENTADOR',
                    'COORDENADOR_TCC'
                ]
            },

            // {
            //     label: 'Sessões e Tarefas',
            //     icon: 'pi pi-fw pi-calendar',
            //     to: '/orientacoes/sessoes',

            //     roles: [
            //         'ADMIN',
            //         'ESTUDANTE',
            //         'ORIENTADOR'
            //     ]
            // }
        ]
    },

    // =====================================================
    // 4. ARTIGO CIENTÍFICO
    // =====================================================
    {
        label: 'Artigo Científico',
        icon: 'pi pi-fw pi-file-edit',

        roles: [
            'ADMIN',
            'ESTUDANTE',
            'ORIENTADOR'
        ],

        items: [
            {
                label: 'Editor IMRaD',
                icon: 'pi pi-fw pi-pencil',
                to: '/pages/article',

                roles: [
                    'ADMIN',
                    'ESTUDANTE',
                    'ORIENTADOR'
                ]
            }
        ]
    },

    // =====================================================
    // 5. CALENDÁRIO DE DEFESAS
    // =====================================================
    {
        label: 'Defesas Públicas',
        icon: 'pi pi-fw pi-calendar',

        roles: [
            'ADMIN',
            'ESTUDANTE',
            'ORIENTADOR',
            'PRESIDENTE_JURI',
            'OPONENTE',
            'COORDENADOR_TCC'
        ],

        items: [
            {
                label: 'Agendar Defesa',
                icon: 'pi pi-fw pi-plus-circle',
                to: '/pages/defense/schedule',

                roles: [
                    'ADMIN',
                    'COORDENADOR_TCC'
                ]
            },

            {
                label: 'Calendário de Defesas',
                icon: 'pi pi-fw pi-calendar-times',
                to: '/pages/defense/calendar',

                roles: [
                    'ADMIN',
                    'ESTUDANTE',
                    'ORIENTADOR',
                    'PRESIDENTE_JURI',
                    'OPONENTE',
                    'COORDENADOR_TCC'
                ]
            }
        ]
    },

    // =====================================================
    // 6. FICHA DE AVALIAÇÃO E ACTA
    // =====================================================
    {
        label: 'Avaliação e Acta',
        icon: 'pi pi-fw pi-file-check',

        roles: [
            'ADMIN',
            'PRESIDENTE_JURI',
            'OPONENTE',
            'ORIENTADOR',
            'COORDENADOR_TCC'
        ],

        items: [
            {
                label: 'Ficha de Avaliação',
                icon: 'pi pi-fw pi-check-square',
                to: '/pages/minutes/form',

                roles: [
                    'ADMIN',
                    'PRESIDENTE_JURI',
                    'OPONENTE',
                    'ORIENTADOR'
                ]
            },

            {
                label: 'Acta de Defesa',
                icon: 'pi pi-fw pi-file-pdf',
                to: '/pages/minutes',

                roles: [
                    'ADMIN',
                    'PRESIDENTE_JURI',
                    'COORDENADOR_TCC'
                ]
            }
        ]
    },
    // =====================================================
    // Gestão de Usuários
    // =====================================================
    {
        label: 'Gestão de Usuários',
        icon: 'pi pi-fw pi-users',
        roles: [
            'ADMIN',
            'COORDENADOR_TCC',
            'CHEFE_DEPARTAMENTO'
        ],
        items: [
            {
                label: 'Usuários',
                icon: 'pi pi-fw pi-user-plus',
                to: '/pages/users/sada/users',
                roles: [
                    'ADMIN',
                    'COORDENADOR_TCC',
                    'CHEFE_DEPARTAMENTO'
                ]
            },
            {
                label: 'Perfis',
                icon: 'pi pi-fw pi-shield',
                to: '/pages/users/sada/profiles',
                roles: [
                    'ADMIN'
                ]
            },
            {
                label: 'Permissões',
                icon: 'pi pi-fw pi-key',
                to: '/pages/users/sada/permitions',
                roles: [
                    'ADMIN'
                ]
            }
        ]
    }
];

/**
 * =========================================================
 * FILTRO POR ROLE
 * =========================================================
 */
const filterMenuByRole = (
    items: AppMenuItemWithRoles[],
    userRoles: string[]
): AppMenuItemWithRoles[] => {

    return items
        .filter((item) => {

            // Se o item não possui roles,
            // fica disponível para todos.
            if (!item.roles || item.roles.length === 0) {
                return true;
            }

            // Verifica se o usuário possui pelo menos
            // uma das roles necessárias.
            return item.roles.some((role) =>
                userRoles.includes(role)
            );
        })

        .map((item) => {

            // Se possui submenus,
            // filtra também os filhos.
            if (item.items) {

                const filteredChildren = filterMenuByRole(
                    item.items,
                    userRoles
                );

                return {
                    ...item,
                    items: filteredChildren
                };
            }

            return item;
        })

        // Remove menus principais que ficaram
        // sem nenhum filho disponível.
        .filter((item) => {

            if (!item.items) {
                return true;
            }

            return item.items.length > 0;
        });
};

/**
 * =========================================================
 * APP MENU
 * =========================================================
 */
const AppMenu = () => {

    const [userRoles, setUserRoles] = useState<string[]>([]);

    /**
     * =====================================================
     * CARREGAR ROLES
     * =====================================================
     *
     * Executado somente uma vez quando o menu é montado.
     */
    useEffect(() => {

        const user = getUserFromStorage();

        console.log(
            'DADOS DO STORAGE:',
            user
        );

        /**
         * De acordo com o JSON que você mostrou:
         *
         * user
         *   └── data
         *        └── user
         *             └── roles
         */
        const roles: string[] =
            user?.data?.user?.roles ?? [];

        console.log(
            'ROLES DO USUÁRIO:',
            roles
        );

        setUserRoles(roles);

    }, []);

    /**
     * =====================================================
     * MENU FILTRADO
     * =====================================================
     *
     * Só recalcula quando userRoles mudar.
     */
    const filteredModel = useMemo(() => {

        return filterMenuByRole(
            model,
            userRoles
        );

    }, [userRoles]);

    /**
     * =====================================================
     * DEBUG
     * =====================================================
     */
    useEffect(() => {

        console.log(
            'MENU FILTRADO:',
            filteredModel
        );

    }, [filteredModel]);

    /**
     * =====================================================
     * RENDER
     * =====================================================
     */
    return (
        <MenuProvider>

            <ul className="layout-menu">

                {filteredModel.map((item, index) => {

                    if (item?.seperator) {

                        return (
                            <li
                                key={`separator-${index}`}
                                className="menu-separator"
                            />
                        );
                    }

                    return (
                        <AppMenuitem
                            key={`${item.label}-${index}`}
                            item={item}
                            root={true}
                            index={index}
                        />
                    );
                })}

            </ul>

        </MenuProvider>
    );
};

export default AppMenu;