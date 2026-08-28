'use client';

import React, { useEffect, useRef, useState } from 'react';

import {
    getMyDefense,
    StudentDefense,
    uploadDefenseDocument2
} from '@/app/api/scheduleDefense/scheduleDefense';

import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import { Message } from 'primereact/message';

const DefensePage: React.FC = () => {

    const [defense, setDefense] =
        useState<StudentDefense | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [uploading, setUploading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [success, setSuccess] =
        useState<string | null>(null);

    const fileInputRef =
        useRef<HTMLInputElement>(null);


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

            console.error(
                'Erro ao carregar defesa:',
                err
            );

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
    // SELECIONAR FICHEIRO
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

        if (!file) {
            return;
        }

        setError(null);
        setSuccess(null);


        // -------------------------------------------------
        // VALIDAR PDF
        // -------------------------------------------------

        if (
            file.type !== 'application/pdf' &&
            !file.name.toLowerCase().endsWith('.pdf')
        ) {

            setError(
                'Apenas ficheiros PDF são permitidos.'
            );

            event.target.value = '';

            return;
        }


        // -------------------------------------------------
        // VALIDAR TAMANHO
        // -------------------------------------------------

        const maxSize =
            10 * 1024 * 1024;

        if (file.size > maxSize) {

            setError(
                'O ficheiro não pode ultrapassar 10 MB.'
            );

            event.target.value = '';

            return;
        }


        if (!defense) {
            return;
        }


        try {

            setUploading(true);

            await uploadDefenseDocument2(
                defense.id,
                file
            );

            setSuccess(
                'Versão final da monografia submetida com sucesso.'
            );

            await loadDefense();

        } catch (err: any) {

            console.error(
                'Erro ao submeter documento:',
                err
            );

            setError(
                err?.response?.data?.message ||
                'Erro ao submeter a versão final da monografia.'
            );

        } finally {

            setUploading(false);

            event.target.value = '';

        }
    };


    // =====================================================
    // FORMATAR DATA
    // =====================================================

    const formatDate = (
        date?: string | null
    ) => {

        if (!date) {
            return '-';
        }

        const [year, month, day] =
            date.split('T')[0].split('-');

        return `${day}/${month}/${year}`;
    };


    // =====================================================
    // FORMATAR HORA
    // =====================================================

    const formatTime = (
        time?: string | null
    ) => {

        if (!time) {
            return '-';
        }

        return time.substring(0, 5);

    };


    // =====================================================
    // STATUS
    // =====================================================

    const getStatusLabel = (
        status: string
    ) => {

        switch (status) {

            case 'AGENDADO':
                return 'Defesa agendada';

            case 'REALIZADO':
                return 'Defesa realizada';

            case 'CANCELADO':
                return 'Defesa cancelada';

            default:
                return status;

        }
    };


    const getStatusSeverity = (
        status: string
    ) => {

        switch (status) {

            case 'AGENDADO':
                return 'info';

            case 'REALIZADO':
                return 'success';

            case 'CANCELADO':
                return 'danger';

            default:
                return 'secondary';

        }
    };


    // =====================================================
    // ROLE DA BANCA
    // =====================================================

    const getRoleLabel = (
        role: string
    ) => {

        switch (role) {

            case 'PRESIDENTE':
                return 'Presidente';

            case 'ORIENTADOR':
                return 'Orientador';

            case 'OPONENTE':
                return 'Oponente';

            default:
                return role;

        }
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="grid">

                {/* HEADER */}

                <div className="col-12">

                    <Skeleton
                        height="80px"
                    />

                </div>


                {/* STATUS */}

                <div className="col-12">

                    <Skeleton
                        height="120px"
                    />

                </div>


                {/* INFORMAÇÕES */}

                <div className="col-12 lg:col-8">

                    <Skeleton
                        height="380px"
                    />

                </div>


                {/* DOCUMENTO */}

                <div className="col-12 lg:col-4">

                    <Skeleton
                        height="380px"
                    />

                </div>


                {/* BANCA */}

                <div className="col-12">

                    <Skeleton
                        height="280px"
                    />

                </div>

            </div>

        );

    }


    // =====================================================
    // SEM DEFESA
    // =====================================================

    if (!defense) {

        return (

            <div className="grid">

                <div className="col-12">

                    <Card>

                        <div className="
                            flex
                            flex-column
                            align-items-center
                            justify-content-center
                            text-center
                            py-6
                        ">

                            <i
                                className="
                                    pi
                                    pi-calendar-times
                                    text-400
                                "
                                style={{
                                    fontSize: '3.5rem'
                                }}
                            />

                            <h3 className="
                                text-900
                                mt-4
                                mb-2
                            ">
                                Defesa ainda não agendada
                            </h3>

                            <p className="
                                text-600
                                m-0
                            ">
                                Neste momento não existe uma
                                defesa agendada para a sua
                                monografia.
                            </p>

                        </div>

                    </Card>

                </div>

            </div>

        );

    }


    const formattedDate =
        formatDate(defense.schedule.date);


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="grid">

            {/* ================================================= */}
            {/* CABEÇALHO */}
            {/* ================================================= */}

            <div className="col-12">

                <div className="
                    flex
                    flex-column
                    md:flex-row
                    md:align-items-center
                    md:justify-content-between
                    gap-3
                ">

                    <div>

                        <h3 className="
                            text-900
                            font-semibold
                            m-0
                        ">
                            Minha Defesa
                        </h3>

                        <p className="
                            text-600
                            mt-2
                            mb-0
                        ">
                            Consulte os dados da sua defesa,
                            a banca examinadora e submeta a
                            versão final da monografia.
                        </p>

                    </div>


                    <Tag
                        value={getStatusLabel(
                            defense.schedule.status
                        )}
                        // severity={getStatusSeverity(
                        //     defense.schedule.status
                        // )}
                    />

                </div>

            </div>


            {/* ================================================= */}
            {/* MENSAGENS */}
            {/* ================================================= */}

            {error && (

                <div className="col-12">

                    <Message
                        severity="error"
                        text={error}
                        className="w-full"
                    />

                </div>

            )}


            {success && (

                <div className="col-12">

                    <Message
                        severity="success"
                        text={success}
                        className="w-full"
                    />

                </div>

            )}


            {/* ================================================= */}
            {/* RESUMO DA DEFESA */}
            {/* ================================================= */}

            <div className="col-12">

                <Card>

                    <div className="grid">

                        {/* DATA */}

                        <div className="
                            col-12
                            md:col-4
                        ">

                            <div className="
                                flex
                                align-items-center
                                gap-3
                            ">

                                <div className="
                                    flex
                                    align-items-center
                                    justify-content-center
                                    border-round
                                    bg-blue-100
                                    w-3rem
                                    h-3rem
                                ">

                                    <i className="
                                        pi
                                        pi-calendar
                                        text-blue-500
                                        text-xl
                                    " />

                                </div>

                                <div>

                                    <span className="
                                        block
                                        text-500
                                        text-sm
                                    ">
                                        Data da defesa
                                    </span>

                                    <span className="
                                        block
                                        text-900
                                        font-semibold
                                        mt-1
                                    ">
                                        {formattedDate}
                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* HORÁRIO */}

                        <div className="
                            col-12
                            md:col-4
                        ">

                            <div className="
                                flex
                                align-items-center
                                gap-3
                            ">

                                <div className="
                                    flex
                                    align-items-center
                                    justify-content-center
                                    border-round
                                    bg-orange-100
                                    w-3rem
                                    h-3rem
                                ">

                                    <i className="
                                        pi
                                        pi-clock
                                        text-orange-500
                                        text-xl
                                    " />

                                </div>

                                <div>

                                    <span className="
                                        block
                                        text-500
                                        text-sm
                                    ">
                                        Horário
                                    </span>

                                    <span className="
                                        block
                                        text-900
                                        font-semibold
                                        mt-1
                                    ">
                                        {formatTime(
                                            defense.schedule.start_time
                                        )}
                                        {' - '}
                                        {formatTime(
                                            defense.schedule.end_time
                                        )}
                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* SALA */}

                        <div className="
                            col-12
                            md:col-4
                        ">

                            <div className="
                                flex
                                align-items-center
                                gap-3
                            ">

                                <div className="
                                    flex
                                    align-items-center
                                    justify-content-center
                                    border-round
                                    bg-purple-100
                                    w-3rem
                                    h-3rem
                                ">

                                    <i className="
                                        pi
                                        pi-building
                                        text-purple-500
                                        text-xl
                                    " />

                                </div>

                                <div>

                                    <span className="
                                        block
                                        text-500
                                        text-sm
                                    ">
                                        Sala
                                    </span>

                                    <span className="
                                        block
                                        text-900
                                        font-semibold
                                        mt-1
                                    ">
                                        {defense.room.name}
                                    </span>

                                    {defense.room.location && (

                                        <span className="
                                            block
                                            text-500
                                            text-sm
                                            mt-1
                                        ">
                                            {defense.room.location}
                                        </span>

                                    )}

                                </div>

                            </div>

                        </div>

                    </div>

                </Card>

            </div>


            {/* ================================================= */}
            {/* TÍTULO + INFORMAÇÕES */}
            {/* ================================================= */}

            <div className="col-12 lg:col-8">

                <Card>

                    {/* TÍTULO */}

                    <div className="
                        flex
                        align-items-start
                        gap-3
                    ">

                        <div className="
                            flex
                            align-items-center
                            justify-content-center
                            border-round
                            bg-primary-100
                            w-3rem
                            h-3rem
                            flex-shrink-0
                        ">

                            <i className="
                                pi
                                pi-book
                                text-primary
                                text-xl
                            " />

                        </div>


                        <div>

                            <span className="
                                block
                                text-500
                                text-sm
                            ">
                                Trabalho de Culminação de Curso
                            </span>

                            <h4 className="
                                text-900
                                mt-1
                                mb-0
                                line-height-3
                            ">
                                {defense.tcc.title}
                            </h4>

                        </div>

                    </div>


                    <Divider />


                    {/* INFORMAÇÕES */}

                    <h5 className="
                        text-900
                        m-0
                    ">
                        Informações da defesa
                    </h5>


                    <div className="grid mt-2">

                        <div className="
                            col-12
                            md:col-6
                        ">

                            <InfoItem
                                icon="pi-calendar"
                                label="Data"
                                value={formattedDate}
                                iconClass="text-blue-500"
                                bgClass="bg-blue-100"
                            />

                        </div>


                        <div className="
                            col-12
                            md:col-6
                        ">

                            <InfoItem
                                icon="pi-clock"
                                label="Horário"
                                value={`
                                    ${formatTime(
                                        defense.schedule.start_time
                                    )}
                                    -
                                    ${formatTime(
                                        defense.schedule.end_time
                                    )}
                                `}
                                iconClass="text-orange-500"
                                bgClass="bg-orange-100"
                            />

                        </div>


                        <div className="
                            col-12
                            md:col-6
                        ">

                            <InfoItem
                                icon="pi-building"
                                label="Sala"
                                value={defense.room.name}
                                iconClass="text-purple-500"
                                bgClass="bg-purple-100"
                            />

                        </div>


                        <div className="
                            col-12
                            md:col-6
                        ">

                            <InfoItem
                                icon="pi-map-marker"
                                label="Localização"
                                value={
                                    defense.room.location ||
                                    'Não informada'
                                }
                                iconClass="text-green-500"
                                bgClass="bg-green-100"
                            />

                        </div>

                    </div>

                </Card>

            </div>


            {/* ================================================= */}
            {/* DOCUMENTO */}
            {/* ================================================= */}

            <div className="
                col-12
                lg:col-4
            ">

                <Card>

                    <div className="
                        flex
                        align-items-center
                        justify-content-between
                        gap-2
                    ">

                        <div>

                            <h5 className="
                                text-900
                                m-0
                            ">
                                Versão final
                            </h5>

                            <small className="
                                text-500
                            ">
                                Monografia
                            </small>

                        </div>


                        <i className="
                            pi
                            pi-file-pdf
                            text-primary
                            text-2xl
                        " />

                    </div>


                    <Divider />


                    {defense.document.uploaded ? (

                        <>

                            <div className="
                                surface-50
                                border-round-lg
                                p-3
                            ">

                                <div className="
                                    flex
                                    align-items-start
                                    gap-3
                                ">

                                    <i className="
                                        pi
                                        pi-check-circle
                                        text-green-500
                                        text-xl
                                    " />

                                    <div>

                                        <span className="
                                            block
                                            text-900
                                            font-semibold
                                        ">
                                            Documento submetido
                                        </span>

                                        <span className="
                                            block
                                            text-600
                                            text-sm
                                            mt-1
                                            line-height-3
                                        ">
                                            A versão final da
                                            monografia já foi
                                            carregada.
                                        </span>

                                    </div>

                                </div>

                            </div>


                            {defense.document.url && (

                                <Button
                                    label="Ver documento"
                                    icon="pi pi-eye"
                                    outlined
                                    className="w-full mt-3"
                                    onClick={() =>
                                        window.open(
                                            defense.document.url!,
                                            '_blank',
                                            'noopener,noreferrer'
                                        )
                                    }
                                />

                            )}


                            <Button
                                label={
                                    uploading
                                        ? 'A substituir...'
                                        : 'Substituir documento'
                                }
                                icon={
                                    uploading
                                        ? 'pi pi-spin pi-spinner'
                                        : 'pi pi-upload'
                                }
                                className="w-full mt-2"
                                disabled={uploading}
                                onClick={handleSelectFile}
                            />

                        </>

                    ) : (

                        <>

                            <div className="
                                surface-50
                                border-round-lg
                                p-3
                            ">

                                <div className="
                                    flex
                                    align-items-start
                                    gap-3
                                ">

                                    <i className="
                                        pi
                                        pi-exclamation-circle
                                        text-orange-500
                                        text-xl
                                    " />

                                    <div>

                                        <span className="
                                            block
                                            text-900
                                            font-semibold
                                        ">
                                            Documento pendente
                                        </span>

                                        <span className="
                                            block
                                            text-600
                                            text-sm
                                            mt-1
                                            line-height-3
                                        ">
                                            Submeta a versão final
                                            da sua monografia em
                                            formato PDF.
                                        </span>

                                    </div>

                                </div>

                            </div>


                            <Button
                                label={
                                    uploading
                                        ? 'A enviar...'
                                        : 'Submeter versão final'
                                }
                                icon={
                                    uploading
                                        ? 'pi pi-spin pi-spinner'
                                        : 'pi pi-upload'
                                }
                                className="w-full mt-3"
                                disabled={uploading}
                                onClick={handleSelectFile}
                            />


                            <small className="
                                block
                                text-center
                                text-500
                                mt-3
                            ">
                                Apenas PDF · Máximo 10 MB
                            </small>

                        </>

                    )}


                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf,.pdf"
                        className="hidden"
                        onChange={handleUpload}
                    />

                </Card>

            </div>


            {/* ================================================= */}
            {/* BANCA EXAMINADORA */}
            {/* ================================================= */}

            <div className="col-12">

                <Card>

                    <div className="
                        flex
                        align-items-center
                        justify-content-between
                    ">

                        <div>

                            <h5 className="
                                text-900
                                m-0
                            ">
                                Banca examinadora
                            </h5>

                            <small className="
                                text-500
                            ">
                                Membros responsáveis pela avaliação
                                da defesa
                            </small>

                        </div>


                        <i className="
                            pi
                            pi-users
                            text-primary
                            text-2xl
                        " />

                    </div>


                    <Divider />


                    {defense.jury.length === 0 ? (

                        <div className="
                            text-center
                            py-5
                        ">

                            <i className="
                                pi
                                pi-users
                                text-400
                                text-4xl
                            " />

                            <p className="
                                text-500
                                mt-3
                                mb-0
                            ">
                                A banca examinadora ainda
                                não foi definida.
                            </p>

                        </div>

                    ) : (

                        <div className="grid">

                            {defense.jury.map(
                                (member) => (

                                    <div
                                        key={member.id}
                                        className="
                                            col-12
                                            md:col-6
                                            lg:col-4
                                        "
                                    >

                                        <div className="
                                            surface-50
                                            border-round-lg
                                            p-3
                                            h-full
                                        ">

                                            <div className="
                                                flex
                                                align-items-center
                                                gap-3
                                            ">

                                                <div className="
                                                    flex
                                                    align-items-center
                                                    justify-content-center
                                                    border-circle
                                                    bg-primary
                                                    text-white
                                                    w-3rem
                                                    h-3rem
                                                    flex-shrink-0
                                                ">

                                                    <i className="
                                                        pi
                                                        pi-user
                                                    " />

                                                </div>


                                                <div className="
                                                    min-w-0
                                                    flex-1
                                                ">

                                                    <span className="
                                                        block
                                                        text-900
                                                        font-semibold
                                                        white-space-nowrap
                                                        overflow-hidden
                                                        text-overflow-ellipsis
                                                    ">
                                                        {member.name}
                                                    </span>

                                                    <Tag
                                                        value={getRoleLabel(
                                                            member.role
                                                        )}
                                                        severity="info"
                                                        className="mt-2"
                                                    />

                                                    {member.email && (

                                                        <span className="
                                                            block
                                                            text-500
                                                            text-sm
                                                            mt-2
                                                            overflow-hidden
                                                            text-overflow-ellipsis
                                                        ">
                                                            {member.email}
                                                        </span>

                                                    )}

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </Card>

            </div>


            {/* ================================================= */}
            {/* LOCALIZAÇÃO */}
            {/* ================================================= */}

            <div className="
                col-12
                lg:col-6
            ">

                <Card>

                    <div className="
                        flex
                        align-items-center
                        gap-2
                    ">

                        <i className="
                            pi
                            pi-map-marker
                            text-primary
                            text-xl
                        " />

                        <h5 className="
                            text-900
                            m-0
                        ">
                            Local da defesa
                        </h5>

                    </div>


                    <Divider />


                    <div className="
                        surface-50
                        border-round-lg
                        p-4
                    ">

                        <div className="
                            flex
                            align-items-center
                            gap-3
                        ">

                            <div className="
                                flex
                                align-items-center
                                justify-content-center
                                border-round
                                bg-primary-100
                                w-3rem
                                h-3rem
                            ">

                                <i className="
                                    pi
                                    pi-building
                                    text-primary
                                    text-xl
                                " />

                            </div>


                            <div>

                                <span className="
                                    block
                                    text-900
                                    font-semibold
                                ">
                                    {defense.room.name}
                                </span>

                                <span className="
                                    block
                                    text-600
                                    text-sm
                                    mt-1
                                ">
                                    {defense.room.location ||
                                        'Localização não informada'}
                                </span>

                            </div>

                        </div>

                    </div>

                </Card>

            </div>


            {/* ================================================= */}
            {/* RESUMO DO HORÁRIO */}
            {/* ================================================= */}

            <div className="
                col-12
                lg:col-6
            ">

                <Card>

                    <div className="
                        flex
                        align-items-center
                        gap-2
                    ">

                        <i className="
                            pi
                            pi-calendar
                            text-primary
                            text-xl
                        " />

                        <h5 className="
                            text-900
                            m-0
                        ">
                            Agendamento
                        </h5>

                    </div>


                    <Divider />


                    <div className="
                        surface-50
                        border-round-lg
                        p-4
                    ">

                        <div className="
                            flex
                            align-items-center
                            justify-content-between
                            gap-3
                        ">

                            <div>

                                <span className="
                                    block
                                    text-500
                                    text-sm
                                ">
                                    Data
                                </span>

                                <span className="
                                    block
                                    text-900
                                    font-semibold
                                    mt-1
                                ">
                                    {formattedDate}
                                </span>

                            </div>


                            <div className="
                                text-right
                            ">

                                <span className="
                                    block
                                    text-500
                                    text-sm
                                ">
                                    Horário
                                </span>

                                <span className="
                                    block
                                    text-900
                                    font-semibold
                                    mt-1
                                ">
                                    {formatTime(
                                        defense.schedule.start_time
                                    )}
                                    {' - '}
                                    {formatTime(
                                        defense.schedule.end_time
                                    )}
                                </span>

                            </div>

                        </div>

                    </div>

                </Card>

            </div>

        </div>

    );
};


// =====================================================
// COMPONENTE DE INFORMAÇÃO
// =====================================================

interface InfoItemProps {

    icon: string;

    label: string;

    value: string;

    iconClass: string;

    bgClass: string;

}


const InfoItem: React.FC<InfoItemProps> = ({
    icon,
    label,
    value,
    iconClass,
    bgClass
}) => {

    return (

        <div className="
            flex
            align-items-center
            gap-3
        ">

            <div className={`
                flex
                align-items-center
                justify-content-center
                border-round
                ${bgClass}
                w-3rem
                h-3rem
                flex-shrink-0
            `}>

                <i
                    className={`
                        pi
                        ${icon}
                        ${iconClass}
                        text-xl
                    `}
                />

            </div>


            <div className="min-w-0">

                <span className="
                    block
                    text-500
                    text-sm
                ">
                    {label}
                </span>

                <span className="
                    block
                    text-900
                    font-semibold
                    mt-1
                    line-height-2
                ">
                    {value.trim()}
                </span>

            </div>

        </div>

    );

};


export default DefensePage;
