'use client';

import Loader from "@/app/(main)/uikit/load/loader";
import { useClint } from "@/app/hooks/client/useClint";
import { CustomerService } from "@/demo/service/CustomerService";
import { Demo } from "@/types";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Column, ColumnFilterApplyTemplateOptions, ColumnFilterClearTemplateOptions, ColumnFilterElementTemplateOptions } from "primereact/column";
import { DataTable, DataTableFilterMeta } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { ProgressBar } from "primereact/progressbar";
import { Slider } from "primereact/slider";
import { TriStateCheckbox } from "primereact/tristatecheckbox";
import { classNames } from "primereact/utils";
import React, { useEffect, useState } from "react";

const ListFreelancers = () => {
   
    const { client, loading, error } = useClint();
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
        return rowData.cidade == null ? '-' : rowData.cidade;
    };


    if (loading) {
        return (
          <Loader/>
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
                        <h5>Clientes</h5>
                        <DataTable
                            value={client}
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
                        // header={header1}
                        >
                            <Column field="id" header="Id" filter filterPlaceholder="Search by name" style={{ minWidth: '12rem' }} />
                            <Column field="nome" header="Nome" body={nomeTemplate} filter filterPlaceholder="Search by name" style={{ minWidth: '12rem' }} />
                            <Column field="pais" header="Nacionalidade" body={nacionalidadeTemplate} filter filterPlaceholder="Search by name" style={{ minWidth: '12rem' }} />
                            <Column field="cidade" header="Cidade" body={cidadeTemplate} filter filterPlaceholder="Search by name" style={{ minWidth: '12rem' }} />

                            <Column field="verified" header="Ações" dataType="boolean" bodyClassName="text-center" style={{ minWidth: '8rem' }} body={actionsFiels} />
                        </DataTable>
                    </div>
                </div>
            </div>
        );
    }
};

export default ListFreelancers;
