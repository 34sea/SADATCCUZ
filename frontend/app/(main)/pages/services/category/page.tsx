'use client';

import Loader from "@/app/(main)/uikit/load/loader";
import { useCategory } from "@/app/hooks/category/categoryService";
import { useCreateCategory } from "@/app/hooks/category/useCreateCategory";
import { CustomerService } from "@/demo/service/CustomerService";
import { Demo } from "@/types";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Column, ColumnFilterApplyTemplateOptions, ColumnFilterClearTemplateOptions, ColumnFilterElementTemplateOptions } from "primereact/column";
import { DataTable, DataTableFilterMeta } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";

import React, { useEffect, useState } from "react";

const ListCategory = () => {
    const { addCategory, loadingCategory, errorCategory, success } = useCreateCategory();
    const [productDialog, setProductDialog] = useState(false);
    const [name, setName] = useState<string>('');
    const hideDialog = () => {
        // setSubmitted(false);
        setProductDialog(false);
    };
    const saveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log(name)
        await addCategory({
            id: 'f795fc88-7b33-4291-a9e0-b9b0b964e57f',
            nome: String(name),
            icon_category: 'String'
        });
    };
    const productDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={saveProduct} />
        </>
    );


    const { Category, loading, error } = useCategory();
    const [filters1, setFilters1] = useState<DataTableFilterMeta>({});
    const [globalFilterValue1, setGlobalFilterValue1] = useState('');


    const actionsFiels = (rowData: Demo.Customer) => {
        return (
            <div className="actionsTable" style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ cursor: 'pointer' }}>
                    <i className="pi pi-eye"></i>
                </div>

                <div style={{ cursor: 'pointer', margin: '0px 15px' }}>
                    <i className="pi pi-pencil text-blue-500"></i>
                </div>

                <div style={{ cursor: 'pointer' }}>
                    <i className="pi pi-trash text-red-500"></i>
                </div>



            </div>
        );
    };
    const onGlobalFilterChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters1 = { ...filters1 };
        (_filters1['global'] as any).value = value;

        setFilters1(_filters1);
        setGlobalFilterValue1(value);
    };

    const renderHeader1 = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-plus" label="Adicionar" outlined onClick={() => {
                    setProductDialog(true)
                }} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue1} onChange={onGlobalFilterChange1} placeholder="Pesquisar" />
                </span>
            </div>
        );
    };

    const header1 = renderHeader1();

    const nomeTemplate = (rowData: any) => {
        return rowData.nome == null ? '-' : rowData.nome;
    };

    const nacionalidadeTemplate = (rowData: any) => {
        return rowData.pais == null ? '-' : rowData.pais;
    };

    const cidadeTemplate = (rowData: any) => {
        return rowData.nome == null ? '-' : rowData.nome;
    };


    if (loading || loadingCategory) {
        return (
            <Loader />
        )
    } else if (error != null) {
        return (
            <div>
                <p>{error}</p>
            </div>
        )
    } else {

        return (
            <div className="grid">
                <div className="col-12">
                    <div className="card">
                        <h5>Categorias</h5>
                        <DataTable
                            value={Category}
                            // paginator
                            className="p-datatable-gridlines"
                            showGridlines
                            rows={10}
                            dataKey="id"
                            filters={filters1}
                            filterDisplay="menu"
                            loading={loading}
                            responsiveLayout="scroll"
                            emptyMessage="No customers found."
                            header={header1}
                        >
                            <Column field="id" header="Id" filter filterPlaceholder="Search by name" style={{ minWidth: '12rem' }} />
                            <Column field="nome" header="Nome" body={cidadeTemplate} filter filterPlaceholder="Search by name" style={{ minWidth: '12rem' }} />
                            {/* <Column field="user_id" header="Id user" body={nomeTemplate} filter filterPlaceholder="Search by name" style={{ minWidth: '12rem' }} /> */}
                            {/* <Column field="categoria_id" header="Id categoria" body={nacionalidadeTemplate} filter filterPlaceholder="Search by name" style={{ minWidth: '12rem' }} /> */}


                            <Column field="verified" header="Ações" dataType="boolean" bodyClassName="text-center" style={{ minWidth: '8rem' }} body={actionsFiels} />
                        </DataTable>
                    </div>
                </div>
                <Dialog visible={productDialog} style={{ width: '450px' }} header="Adicionar" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>
                    <form onSubmit={saveProduct}>
                    <div className="field">
                        <label htmlFor="name">Nome</label>
                        <InputText
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoFocus

                        />
                    </div>
                    </form>
                    
                </Dialog>
            </div>


        );
    }
};

export default ListCategory;
