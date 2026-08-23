// /* eslint-disable @next/next/no-img-element */

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

import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import { AppMenuItem } from '@/types';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);

    const model: AppMenuItem[] = [
        // =========================================================
        // 1. PAINEL GERAL
        // =========================================================
        {
            label: 'Painel Geral',
            items: [
                {
                    label: 'Dashboard',
                    icon: 'pi pi-fw pi-home',
                    to: '/dashboard'
                },
                {
                    label: 'Meu Perfil',
                    icon: 'pi pi-fw pi-user',
                    to: '/pages/profile'
                }
            ]
        },

        // =========================================================
        // 2. SUBMISSÃO E APROVAÇÃO DE PRÉ-PROJECTOS
        // =========================================================
        {
            label: 'Pré-Projectos',
            icon: 'pi pi-fw pi-file',
            items: [
                {
                    label: 'Submeter Pré-Projecto',
                    icon: 'pi pi-fw pi-upload',
                    to: '/pre-projectos/submeter'
                },
                {
                    label: 'Gestão de Pré-Projectos',
                    icon: 'pi pi-fw pi-list',
                    to: '/pre-projectos/gestao'
                },
                {
                    label: 'Avaliação de Pré-Projecto',
                    icon: 'pi pi-fw pi-check-square',
                    to: '/pre-projectos/avaliacao'
                }
            ]
        },

        // =========================================================
        // 3. CADERNO DE ORIENTAÇÕES
        // =========================================================
        {
            label: 'Caderno de Orientações',
            icon: 'pi pi-fw pi-book',
            items: [
                {
                    label: 'Painel do Caderno',
                    icon: 'pi pi-fw pi-chart-bar',
                    to: '/orientacoes/dashboard'
                },
                {
                    label: 'Sessões e Tarefas',
                    icon: 'pi pi-fw pi-calendar',
                    to: '/orientacoes/sessoes'
                }
            ]
        },

        // =========================================================
        // 4. ARTIGO CIENTÍFICO
        // =========================================================
        {
            label: 'Artigo Científico',
            icon: 'pi pi-fw pi-file-edit',
            items: [
                {
                    label: 'Editor IMRaD',
                    icon: 'pi pi-fw pi-pencil',
                    to: '/artigo/editor'
                }
            ]
        },

        // =========================================================
        // 5. CALENDÁRIO DE DEFESAS
        // =========================================================
        {
            label: 'Defesas Públicas',
            icon: 'pi pi-fw pi-calendar',
            items: [
                {
                    label: 'Agendar Defesa',
                    icon: 'pi pi-fw pi-plus-circle',
                    to: '/defesas/agendar'
                },
                {
                    label: 'Calendário de Defesas',
                    icon: 'pi pi-fw pi-calendar-times',
                    to: '/defesas/calendario'
                }
            ]
        },

        // =========================================================
        // 6. FICHA DE AVALIAÇÃO E ACTA
        // =========================================================
        {
            label: 'Avaliação e Acta',
            icon: 'pi pi-fw pi-file-check',
            items: [
                {
                    label: 'Ficha de Avaliação',
                    icon: 'pi pi-fw pi-check-square',
                    to: '/avaliacao/ficha'
                },
                {
                    label: 'Acta de Defesa',
                    icon: 'pi pi-fw pi-file-pdf',
                    to: '/avaliacao/acta'
                }
            ]
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? (
                        <AppMenuitem
                            item={item}
                            root={true}
                            index={i}
                            key={item.label}
                        />
                    ) : (
                        <li
                            className="menu-separator"
                            key={`separator-${i}`}
                        />
                    );
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;