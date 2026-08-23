'use client';

import React, { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { classNames } from 'primereact/utils';

import { LayoutContext } from '../../layout/context/layoutcontext';
import { useAuth } from '../hooks/auth/useAuth';

const LoginPage = () => {
    const { authenticate, loading, error } = useAuth();
    const { layoutConfig } = useContext(LayoutContext);

    const router = useRouter();

    const [username, setUsername] = useState('admin@sadatcc.ac.mz');
    const [password, setPassword] = useState('Admin123!');

    const containerClassName = classNames(
        'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
        {
            'p-input-filled': layoutConfig.inputStyle === 'filled'
        }
    );

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (loading) return;

        await authenticate({
            email: username,
            password
        });
    };

    return (
        <div className={containerClassName}>

            <div
                className="flex w-full min-h-screen"
                style={{
                    maxWidth: '1400px'
                }}
            >

                {/* =========================
                    LADO ESQUERDO
                ========================== */}
                <div
                    className="hidden lg:flex lg:w-6 flex-column justify-content-center px-8 xl:px-8"
                    style={{
                        background:
                            'linear-gradient(135deg, var(--primary-color), #173B6C)'
                    }}
                >

                    <div className="max-w-30rem">

                        {/* Logo */}
                        <div className="flex align-items-center mb-6">

                            <div
                                className="flex align-items-center justify-content-center bg-white border-round-xl mr-3"
                                style={{
                                    width: '58px',
                                    height: '58px'
                                }}
                            >
                                <i
                                    className="pi pi-book"
                                    style={{
                                        fontSize: '1.8rem',
                                        color: 'var(--primary-color)'
                                    }}
                                />
                            </div>

                            <div>
                                <div className="text-white text-3xl font-bold">
                                    SADA-TCC
                                </div>

                                <div className="text-blue-100">
                                    Gestão Académica
                                </div>
                            </div>

                        </div>

                        {/* Título */}
                        <h1 className="text-white text-5xl font-bold line-height-2 mb-4">
                            Sistema de Acompanhamento
                            <br />
                            e Defesas Académicas
                        </h1>

                        <p className="text-blue-100 text-xl line-height-3 mb-6">
                            Uma plataforma integrada para gerir todo o
                            ciclo de vida do Trabalho de Culminação de Curso.
                        </p>

                        {/* Funcionalidades */}
                        <div className="flex flex-column gap-4">

                            <div className="flex align-items-center">
                                <i className="pi pi-check-circle text-white text-xl mr-3" />
                                <span className="text-blue-50 text-lg">
                                    Gestão de pré-projectos
                                </span>
                            </div>

                            <div className="flex align-items-center">
                                <i className="pi pi-check-circle text-white text-xl mr-3" />
                                <span className="text-blue-50 text-lg">
                                    Acompanhamento das orientações
                                </span>
                            </div>

                            <div className="flex align-items-center">
                                <i className="pi pi-check-circle text-white text-xl mr-3" />
                                <span className="text-blue-50 text-lg">
                                    Gestão das defesas académicas
                                </span>
                            </div>

                            <div className="flex align-items-center">
                                <i className="pi pi-check-circle text-white text-xl mr-3" />
                                <span className="text-blue-50 text-lg">
                                    Geração de documentos académicos
                                </span>
                            </div>

                        </div>

                    </div>

                </div>


                {/* =========================
                    LADO DIREITO
                ========================== */}
                <div
                    className="w-full lg:w-6 flex align-items-center justify-content-center surface-card px-4 py-6"
                >

                    <form
                        onSubmit={handleLogin}
                        className="w-full"
                        style={{
                            maxWidth: '450px'
                        }}
                    >

                        {/* Cabeçalho mobile */}
                        <div className="flex lg:hidden align-items-center justify-content-center mb-6">

                            <div
                                className="flex align-items-center justify-content-center border-round-xl mr-3"
                                style={{
                                    width: '55px',
                                    height: '55px',
                                    background: 'var(--primary-color)'
                                }}
                            >
                                <i
                                    className="pi pi-book text-white"
                                    style={{
                                        fontSize: '1.7rem'
                                    }}
                                />
                            </div>

                            <div>
                                <div className="text-900 text-2xl font-bold">
                                    SADA-TCC
                                </div>

                                <div className="text-600 text-sm">
                                    Gestão Académica
                                </div>
                            </div>

                        </div>


                        {/* Título */}
                        <div className="mb-6">

                            <div className="text-900 text-4xl font-bold mb-3">
                                Bem-vindo de volta!
                            </div>

                            <div className="text-600 text-lg">
                                Entre na sua conta para continuar.
                            </div>

                        </div>


                        {/* Erro */}
                        {error && (
                            <Message
                                severity="error"
                                text={
                                    typeof error === 'string'
                                        ? error
                                        : 'Não foi possível iniciar sessão. Verifique as suas credenciais.'
                                }
                                className="w-full mb-5"
                            />
                        )}


                        {/* Email */}
                        <div className="mb-5">

                            <label
                                htmlFor="email"
                                className="block text-900 font-semibold text-lg mb-2"
                            >
                                Email
                            </label>

                            <span className="p-input-icon-left w-full">

                                <i className="pi pi-envelope" />

                                <InputText
                                    id="email"
                                    type="email"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    placeholder="Digite o seu email"
                                    className="w-full"
                                    style={{
                                        padding: '1rem',
                                        paddingLeft: '2.8rem'
                                    }}
                                    autoComplete="username"
                                    required
                                />

                            </span>

                        </div>


                        {/* Password */}
                        <div className="mb-4">

                            <div className="flex justify-content-between align-items-center mb-2">

                                <label
                                    htmlFor="password"
                                    className="text-900 font-semibold text-lg"
                                >
                                    Senha
                                </label>

                                <button
                                    type="button"
                                    className="p-0 border-none bg-transparent text-primary cursor-pointer"
                                    onClick={() =>
                                        router.push('/auth/forgot-password')
                                    }
                                >
                                    Esqueceu a senha?
                                </button>

                            </div>

                            <Password
                                inputId="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                placeholder="Digite a sua senha"
                                toggleMask
                                feedback={false}
                                className="w-full"
                                inputClassName="w-full"
                                style={{
                                    width: '100%'
                                }}
                                inputStyle={{
                                    padding: '1rem'
                                }}
                                autoComplete="current-password"
                                required
                            />

                        </div>


                        {/* Botão */}
                        <Button
                            type="submit"
                            label={loading ? 'A entrar...' : 'Entrar'}
                            icon={
                                loading
                                    ? 'pi pi-spin pi-spinner'
                                    : 'pi pi-sign-in'
                            }
                            disabled={loading}
                            className="w-full p-3 text-lg"
                        />

                        {/* Footer */}
                        <div className="text-center mt-6">

                            <span className="text-600">
                                Sistema de Acompanhamento e Defesas Académicas
                            </span>

                            <div className="text-500 text-sm mt-2">
                                SADA-TCC · FCT / Universidade Zambeze
                            </div>

                        </div>

                    </form>

                </div>

            </div>

        </div>
    );
};

export default LoginPage;