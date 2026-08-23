'use client';

import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { Editor } from 'primereact/editor';

const ArticleEditor = () => {
    const [title, setTitle] = useState('');
    const [authors, setAuthors] = useState('');
    const [abstract, setAbstract] = useState('');
    const [keywords, setKeywords] = useState('');

    const [sections, setSections] = useState({
        introduction: '',
        theoretical: '',
        methodology: '',
        results: '',
        discussion: '',
        conclusion: '',
        declarations: '',
        references: ''
    });

    const updateSection = (field: keyof typeof sections, value: string) => {
        setSections((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const calculateProgress = () => {
        const fields = [
            title,
            authors,
            abstract,
            keywords,
            sections.introduction,
            sections.theoretical,
            sections.methodology,
            sections.results,
            sections.discussion,
            sections.conclusion,
            sections.declarations,
            sections.references
        ];

        const completed = fields.filter((field) => field.trim() !== '').length;

        return Math.round((completed / fields.length) * 100);
    };

    const progress = calculateProgress();

    const editorHeader = (
        <span className="ql-formats">
            <select className="ql-header" defaultValue="">
                <option value="1">Título</option>
                <option value="2">Subtítulo</option>
                <option value="">Normal</option>
            </select>

            <button className="ql-bold" />
            <button className="ql-italic" />
            <button className="ql-underline" />

            <button className="ql-list" value="ordered" />
            <button className="ql-list" value="bullet" />

            <button className="ql-link" />
            <button className="ql-clean" />
        </span>
    );

    return (
        <div className="grid">

            {/* CABEÇALHO */}
            <div className="col-12">
                <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3">

                    <div>
                        <h2 className="text-900 font-semibold m-0">
                            Editor de Artigo Científico
                        </h2>

                        <p className="text-600 mt-2 mb-0">
                            Template guiado baseado no modelo IMRaD
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            label="Guardar"
                            icon="pi pi-save"
                            severity="secondary"
                            outlined
                        />

                        <Button
                            label="Exportar Word"
                            icon="pi pi-file-word"
                        />
                    </div>

                </div>
            </div>

            {/* PROGRESSO */}
            <div className="col-12 lg:col-8">
                <Card className="h-full">

                    <div className="flex justify-content-between align-items-center mb-2">
                        <div>
                            <span className="text-900 font-medium">
                                Progresso do artigo
                            </span>

                            <p className="text-600 text-sm mt-1 mb-0">
                                Preencha as secções obrigatórias do artigo.
                            </p>
                        </div>

                        <span className="text-primary font-semibold">
                            {progress}%
                        </span>
                    </div>

                    <ProgressBar
                        value={progress}
                        showValue={false}
                        style={{ height: '8px' }}
                    />

                </Card>
            </div>

            {/* ESTADO */}
            <div className="col-12 lg:col-4">
                <Card className="h-full">

                    <div className="flex align-items-center justify-content-between">
                        <span className="text-900 font-medium">
                            Estado
                        </span>

                        {progress === 100 ? (
                            <Tag
                                value="Completo"
                                severity="success"
                            />
                        ) : (
                            <Tag
                                value="Em edição"
                                severity="warning"
                            />
                        )}
                    </div>

                    <Divider />

                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-info-circle text-primary" />

                        <span className="text-600 text-sm">
                            Complete todas as secções antes da validação editorial.
                        </span>
                    </div>

                </Card>
            </div>

            {/* INFORMAÇÕES PRINCIPAIS */}
            <div className="col-12">
                <Card>

                    <h4 className="text-900 mt-0 mb-4">
                        Informações do artigo
                    </h4>

                    <div className="grid">

                        <div className="col-12">
                            <label
                                htmlFor="title"
                                className="block text-900 font-medium mb-2"
                            >
                                Título do artigo
                            </label>

                            <InputText
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Introduza o título do artigo"
                                className="w-full"
                            />
                        </div>

                        <div className="col-12 lg:col-6">
                            <label
                                htmlFor="authors"
                                className="block text-900 font-medium mb-2"
                            >
                                Autores
                            </label>

                            <InputText
                                id="authors"
                                value={authors}
                                onChange={(e) => setAuthors(e.target.value)}
                                placeholder="Nome dos autores"
                                className="w-full"
                            />
                        </div>

                        <div className="col-12 lg:col-6">
                            <label
                                htmlFor="keywords"
                                className="block text-900 font-medium mb-2"
                            >
                                Palavras-chave
                            </label>

                            <InputText
                                id="keywords"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                placeholder="Ex.: TCC, sistema académico, gestão digital"
                                className="w-full"
                            />
                        </div>

                        <div className="col-12">
                            <label
                                htmlFor="abstract"
                                className="block text-900 font-medium mb-2"
                            >
                                Resumo
                            </label>

                            <InputTextarea
                                id="abstract"
                                value={abstract}
                                onChange={(e) => setAbstract(e.target.value)}
                                placeholder="Escreva o resumo do artigo..."
                                rows={5}
                                className="w-full"
                                autoResize
                            />
                        </div>

                    </div>

                </Card>
            </div>

            {/* INTRODUÇÃO */}
            <div className="col-12">
                <Card>

                    <div className="flex justify-content-between align-items-center mb-3">

                        <div>
                            <h4 className="text-900 m-0">
                                1. Introdução
                            </h4>

                            <span className="text-600 text-sm">
                                Apresente o problema, contexto, objectivos e relevância do estudo.
                            </span>
                        </div>

                        <Tag
                            value={sections.introduction ? 'Preenchido' : 'Pendente'}
                            severity={sections.introduction ? 'success' : 'warning'}
                        />

                    </div>

                    <Editor
                        value={sections.introduction}
                        onTextChange={(e) =>
                            updateSection('introduction', e.htmlValue || '')
                        }
                        headerTemplate={editorHeader}
                        style={{ height: '280px' }}
                    />

                </Card>
            </div>

            {/* ENQUADRAMENTO TEÓRICO */}
            <div className="col-12">
                <Card>

                    <div className="mb-3">
                        <h4 className="text-900 m-0">
                            2. Enquadramento Teórico
                        </h4>

                        <span className="text-600 text-sm">
                            Apresente os conceitos, teorias e trabalhos relacionados.
                        </span>
                    </div>

                    <Editor
                        value={sections.theoretical}
                        onTextChange={(e) =>
                            updateSection('theoretical', e.htmlValue || '')
                        }
                        headerTemplate={editorHeader}
                        style={{ height: '280px' }}
                    />

                </Card>
            </div>

            {/* METODOLOGIA */}
            <div className="col-12">
                <Card>

                    <div className="mb-3">
                        <h4 className="text-900 m-0">
                            3. Metodologia
                        </h4>

                        <span className="text-600 text-sm">
                            Descreva os métodos, técnicas, instrumentos e procedimentos utilizados.
                        </span>
                    </div>

                    <Editor
                        value={sections.methodology}
                        onTextChange={(e) =>
                            updateSection('methodology', e.htmlValue || '')
                        }
                        headerTemplate={editorHeader}
                        style={{ height: '280px' }}
                    />

                </Card>
            </div>

            {/* RESULTADOS */}
            <div className="col-12 lg:col-6">
                <Card>

                    <div className="mb-3">
                        <h4 className="text-900 m-0">
                            4. Resultados
                        </h4>

                        <span className="text-600 text-sm">
                            Apresente os resultados obtidos no estudo.
                        </span>
                    </div>

                    <Editor
                        value={sections.results}
                        onTextChange={(e) =>
                            updateSection('results', e.htmlValue || '')
                        }
                        headerTemplate={editorHeader}
                        style={{ height: '250px' }}
                    />

                </Card>
            </div>

            {/* DISCUSSÃO */}
            <div className="col-12 lg:col-6">
                <Card>

                    <div className="mb-3">
                        <h4 className="text-900 m-0">
                            5. Discussão
                        </h4>

                        <span className="text-600 text-sm">
                            Interprete e discuta os resultados obtidos.
                        </span>
                    </div>

                    <Editor
                        value={sections.discussion}
                        onTextChange={(e) =>
                            updateSection('discussion', e.htmlValue || '')
                        }
                        headerTemplate={editorHeader}
                        style={{ height: '250px' }}
                    />

                </Card>
            </div>

            {/* CONCLUSÃO */}
            <div className="col-12 lg:col-6">
                <Card>

                    <div className="mb-3">
                        <h4 className="text-900 m-0">
                            6. Conclusão
                        </h4>

                        <span className="text-600 text-sm">
                            Apresente as principais conclusões do trabalho.
                        </span>
                    </div>

                    <Editor
                        value={sections.conclusion}
                        onTextChange={(e) =>
                            updateSection('conclusion', e.htmlValue || '')
                        }
                        headerTemplate={editorHeader}
                        style={{ height: '250px' }}
                    />

                </Card>
            </div>

            {/* DECLARAÇÕES */}
            <div className="col-12 lg:col-6">
                <Card>

                    <div className="mb-3">
                        <h4 className="text-900 m-0">
                            7. Declarações Editoriais
                        </h4>

                        <span className="text-600 text-sm">
                            Conflitos de interesse, financiamento e outras declarações.
                        </span>
                    </div>

                    <Editor
                        value={sections.declarations}
                        onTextChange={(e) =>
                            updateSection('declarations', e.htmlValue || '')
                        }
                        headerTemplate={editorHeader}
                        style={{ height: '250px' }}
                    />

                </Card>
            </div>

            {/* REFERÊNCIAS */}
            <div className="col-12">
                <Card>

                    <div className="mb-3">
                        <h4 className="text-900 m-0">
                            8. Referências
                        </h4>

                        <span className="text-600 text-sm">
                            Insira as referências bibliográficas utilizadas no artigo.
                        </span>
                    </div>

                    <Editor
                        value={sections.references}
                        onTextChange={(e) =>
                            updateSection('references', e.htmlValue || '')
                        }
                        headerTemplate={editorHeader}
                        style={{ height: '280px' }}
                    />

                </Card>
            </div>

            {/* CHECKLIST */}
            <div className="col-12">
                <Card>

                    <h4 className="text-900 mt-0">
                        Checklist Editorial
                    </h4>

                    <div className="grid">

                        {[
                            ['Título preenchido', title],
                            ['Autores definidos', authors],
                            ['Resumo preenchido', abstract],
                            ['Palavras-chave definidas', keywords],
                            ['Introdução preenchida', sections.introduction],
                            ['Metodologia preenchida', sections.methodology],
                            ['Resultados preenchidos', sections.results],
                            ['Discussão preenchida', sections.discussion],
                            ['Conclusão preenchida', sections.conclusion],
                            ['Referências inseridas', sections.references]
                        ].map(([label, value], index) => (

                            <div
                                key={index}
                                className="col-12 md:col-6 lg:col-4"
                            >
                                <div className="flex align-items-center gap-2">

                                    <i
                                        className={
                                            value
                                                ? 'pi pi-check-circle text-green-500'
                                                : 'pi pi-circle text-500'
                                        }
                                    />

                                    <span className="text-700 text-sm">
                                        {label}
                                    </span>

                                </div>
                            </div>

                        ))}

                    </div>

                    <Divider />

                    <div className="flex justify-content-end gap-2">

                        <Button
                            label="Guardar rascunho"
                            icon="pi pi-save"
                            severity="secondary"
                            outlined
                        />

                        <Button
                            label="Validar artigo"
                            icon="pi pi-check"
                            disabled={progress < 100}
                        />

                    </div>

                </Card>
            </div>

        </div>
    );
};

export default ArticleEditor;