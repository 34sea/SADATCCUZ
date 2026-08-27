'use client';
import { getMyDefense, StudentDefense, uploadDefenseDocument2 } from '@/app/api/scheduleDefense/scheduleDefense';
import React, { useEffect, useRef, useState } from 'react';
// import {
//     getMyDefense,
//     uploadDefenseDocument,
//     StudentDefense
// } from '../../services/defenseService';

import {
    Calendar,
    Clock,
    MapPin,
    Users,
    FileText,
    Upload,
    CheckCircle2,
    AlertCircle,
    Download,
    UserRound,
    Loader2
} from 'lucide-react';

const DefensePage: React.FC = () => {

    const [defense, setDefense] = useState<StudentDefense | null>(null);

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // =====================================================
    // CARREGAR DEFESA
    // =====================================================

    const loadDefense = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getMyDefense();

            setDefense(data);

        } catch (err: any) {

            console.error(err);

            setError(
                err?.response?.data?.message ||
                'Não foi possível carregar os dados da defesa.'
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDefense();
    }, []);

    // =====================================================
    // SELECIONAR PDF
    // =====================================================

    const handleSelectFile = () => {
        fileInputRef.current?.click();
    };

    // =====================================================
    // UPLOAD
    // =====================================================

    const handleUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {

        const file = event.target.files?.[0];

        if (!file) return;

        setError(null);
        setSuccess(null);

        // Validar tipo
        if (file.type !== 'application/pdf') {

            setError(
                'Apenas arquivos PDF são permitidos.'
            );

            event.target.value = '';
            return;
        }

        // Validar tamanho - 10MB
        const maxSize = 10 * 1024 * 1024;

        if (file.size > maxSize) {

            setError(
                'O arquivo não pode ultrapassar 10 MB.'
            );

            event.target.value = '';
            return;
        }

        if (!defense) return;

        try {

            setUploading(true);

            await uploadDefenseDocument2(
                defense.id,
                file
            );

            setSuccess(
                'Versão final da monografia submetida com sucesso.'
            );

            // Atualizar dados
            await loadDefense();

        } catch (err: any) {

            console.error(err);

            setError(
                err?.response?.data?.message ||
                'Erro ao submeter a versão final.'
            );

        } finally {

            setUploading(false);

            event.target.value = '';
        }
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="flex justify-center items-center min-h-[400px]">

                <div className="text-center">

                    <Loader2
                        className="animate-spin mx-auto text-primary"
                        size={40}
                    />

                    <p className="mt-3 text-gray-500">
                        A carregar informações da defesa...
                    </p>

                </div>

            </div>
        );
    }

    // =====================================================
    // SEM DEFESA
    // =====================================================

    if (!defense) {

        return (
            <div className="p-6">

                <div className="max-w-3xl mx-auto">

                    <div className="bg-white rounded-xl border p-10 text-center">

                        <AlertCircle
                            size={50}
                            className="mx-auto text-gray-400"
                        />

                        <h2 className="text-xl font-semibold mt-4">
                            Defesa ainda não agendada
                        </h2>

                        <p className="text-gray-500 mt-2">
                            Neste momento não existe uma defesa
                            agendada para a sua monografia.
                        </p>

                    </div>

                </div>

            </div>
        );
    }

    // =====================================================
    // FORMATAR DATA
    // =====================================================

    const formattedDate = new Date(
        defense.schedule.date
    ).toLocaleDateString('pt-MZ', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    // =====================================================
    // STATUS
    // =====================================================

    const statusLabel = {
        AGENDADO: 'Defesa agendada',
        REALIZADO: 'Defesa realizada',
        CANCELADO: 'Defesa cancelada'
    }[defense.schedule.status];

    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="p-4 md:p-6">

            <div className="max-w-6xl mx-auto">

                {/* HEADER */}

                <div className="mb-6">

                    <h1 className="text-2xl font-bold text-gray-800">
                        Minha Defesa
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Consulte os dados da sua defesa e submeta
                        a versão final da monografia.
                    </p>

                </div>

                {/* MESSAGES */}

                {error && (

                    <div className="mb-5 flex items-center gap-3
                        bg-red-50 border border-red-200
                        text-red-700 rounded-lg p-4">

                        <AlertCircle size={20} />

                        <span>{error}</span>

                    </div>

                )}

                {success && (

                    <div className="mb-5 flex items-center gap-3
                        bg-green-50 border border-green-200
                        text-green-700 rounded-lg p-4">

                        <CheckCircle2 size={20} />

                        <span>{success}</span>

                    </div>

                )}

                {/* STATUS */}

                <div className="bg-white rounded-xl border p-5 mb-6">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-gray-500">
                                Estado da defesa
                            </p>

                            <div className="flex items-center gap-2 mt-1">

                                <CheckCircle2
                                    size={20}
                                    className="text-green-600"
                                />

                                <span className="font-semibold text-green-700">
                                    {statusLabel}
                                </span>

                            </div>

                        </div>

                        <div className="text-right">

                            <p className="text-sm text-gray-500">
                                Data
                            </p>

                            <p className="font-semibold capitalize">
                                {formattedDate}
                            </p>

                        </div>

                    </div>

                </div>

                {/* GRID */}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ================================= */}
                    {/* DADOS DA DEFESA */}
                    {/* ================================= */}

                    <div className="lg:col-span-2 space-y-6">

                        {/* TCC */}

                        <div className="bg-white rounded-xl border p-6">

                            <div className="flex items-start gap-4">

                                <div className="p-3 rounded-lg bg-blue-50">

                                    <FileText
                                        className="text-blue-600"
                                        size={25}
                                    />

                                </div>

                                <div>

                                    <p className="text-sm text-gray-500">
                                        Título da monografia
                                    </p>

                                    <h2 className="text-lg font-semibold mt-1">
                                        {defense.tcc.title}
                                    </h2>

                                </div>

                            </div>

                        </div>

                        {/* DATA / HORA / SALA */}

                        <div className="bg-white rounded-xl border p-6">

                            <h2 className="font-semibold text-lg mb-5">
                                Informações da defesa
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                <InfoItem
                                    icon={<Calendar size={20} />}
                                    label="Data"
                                    value={formattedDate}
                                />

                                <InfoItem
                                    icon={<Clock size={20} />}
                                    label="Horário"
                                    value={`${defense.schedule.start_time} - ${defense.schedule.end_time}`}
                                />

                                <InfoItem
                                    icon={<MapPin size={20} />}
                                    label="Sala"
                                    value={defense.room.name}
                                />

                                <InfoItem
                                    icon={<MapPin size={20} />}
                                    label="Localização"
                                    value={
                                        defense.room.location ||
                                        'Não informada'
                                    }
                                />

                            </div>

                        </div>

                        {/* BANCA */}

                        <div className="bg-white rounded-xl border p-6">

                            <div className="flex items-center gap-3 mb-5">

                                <Users size={22} />

                                <h2 className="font-semibold text-lg">
                                    Banca examinadora
                                </h2>

                            </div>

                            <div className="space-y-3">

                                {defense.jury.length === 0 ? (

                                    <p className="text-gray-500">
                                        A banca ainda não foi definida.
                                    </p>

                                ) : (

                                    defense.jury.map(member => (

                                        <div
                                            key={member.id}
                                            className="flex items-center gap-4
                                                p-4 rounded-lg bg-gray-50
                                                border"
                                        >

                                            <div className="p-2 rounded-full bg-white">

                                                <UserRound size={20} />

                                            </div>

                                            <div className="flex-1">

                                                <p className="font-medium">
                                                    {member.name}
                                                </p>

                                                <p className="text-sm text-gray-500">
                                                    {member.email}
                                                </p>

                                            </div>

                                            <span className="
                                                px-3 py-1
                                                rounded-full
                                                text-xs
                                                font-medium
                                                bg-blue-50
                                                text-blue-700
                                            ">
                                                {member.role}
                                            </span>

                                        </div>

                                    ))

                                )}

                            </div>

                        </div>

                    </div>

                    {/* ================================= */}
                    {/* DOCUMENTO */}
                    {/* ================================= */}

                    <div>

                        <div className="bg-white rounded-xl border p-6 sticky top-6">

                            <div className="flex items-center gap-3 mb-5">

                                <FileText
                                    size={22}
                                    className="text-primary"
                                />

                                <h2 className="font-semibold text-lg">
                                    Versão final
                                </h2>

                            </div>

                            {defense.document.uploaded ? (

                                <div>

                                    <div className="
                                        bg-green-50
                                        border border-green-200
                                        rounded-lg
                                        p-4
                                        mb-4
                                    ">

                                        <div className="flex gap-3">

                                            <CheckCircle2
                                                className="text-green-600"
                                                size={22}
                                            />

                                            <div>

                                                <p className="font-medium text-green-800">
                                                    Documento submetido
                                                </p>

                                                <p className="text-sm text-green-700 mt-1">
                                                    A versão final da sua
                                                    monografia já foi carregada.
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                    {defense.document.url && (

                                        <a
                                            href={defense.document.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="
                                                w-full
                                                flex
                                                justify-center
                                                items-center
                                                gap-2
                                                px-4
                                                py-3
                                                rounded-lg
                                                border
                                                border-gray-300
                                                hover:bg-gray-50
                                                transition
                                            "
                                        >

                                            <Download size={18} />

                                            Ver documento

                                        </a>

                                    )}

                                    <button
                                        type="button"
                                        onClick={handleSelectFile}
                                        disabled={uploading}
                                        className="
                                            w-full
                                            mt-3
                                            flex
                                            justify-center
                                            items-center
                                            gap-2
                                            px-4
                                            py-3
                                            rounded-lg
                                            bg-primary
                                            text-white
                                            hover:opacity-90
                                            disabled:opacity-50
                                        "
                                    >

                                        <Upload size={18} />

                                        Substituir documento

                                    </button>

                                </div>

                            ) : (

                                <div>

                                    <div className="
                                        bg-yellow-50
                                        border border-yellow-200
                                        rounded-lg
                                        p-4
                                        mb-5
                                    ">

                                        <div className="flex gap-3">

                                            <AlertCircle
                                                className="text-yellow-600"
                                                size={22}
                                            />

                                            <div>

                                                <p className="font-medium text-yellow-800">
                                                    Documento pendente
                                                </p>

                                                <p className="text-sm text-yellow-700 mt-1">
                                                    Submeta a versão final
                                                    da sua monografia em PDF.
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSelectFile}
                                        disabled={uploading}
                                        className="
                                            w-full
                                            flex
                                            justify-center
                                            items-center
                                            gap-2
                                            px-4
                                            py-3
                                            rounded-lg
                                            bg-primary
                                            text-white
                                            hover:opacity-90
                                            disabled:opacity-50
                                        "
                                    >

                                        {uploading ? (

                                            <>
                                                <Loader2
                                                    size={18}
                                                    className="animate-spin"
                                                />

                                                A enviar...

                                            </>

                                        ) : (

                                            <>
                                                <Upload size={18} />

                                                Submeter versão final

                                            </>

                                        )}

                                    </button>

                                    <p className="text-xs text-gray-500 mt-3 text-center">
                                        Apenas PDF · Máximo 10 MB
                                    </p>

                                </div>

                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="application/pdf,.pdf"
                                className="hidden"
                                onChange={handleUpload}
                            />

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

// =====================================================
// COMPONENTE DE INFORMAÇÃO
// =====================================================

interface InfoItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({
    icon,
    label,
    value
}) => {

    return (

        <div className="flex items-start gap-3">

            <div className="text-primary mt-1">
                {icon}
            </div>

            <div>

                <p className="text-sm text-gray-500">
                    {label}
                </p>

                <p className="font-medium capitalize">
                    {value}
                </p>

            </div>

        </div>
    );
};

export default DefensePage;