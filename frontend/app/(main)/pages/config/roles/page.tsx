'use client';

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

const Roles = () => {


    const [customers1, setCustomers1] = useState<Demo.Customer[]>([]);
    const [filters1, setFilters1] = useState<DataTableFilterMeta>({});
    const [loading1, setLoading1] = useState(true);
    const [globalFilterValue1, setGlobalFilterValue1] = useState('');

    const representatives = [
        { name: 'Amy Elsner', image: 'amyelsner.png' },
        { name: 'Anna Fali', image: 'annafali.png' },
        { name: 'Asiya Javayant', image: 'asiyajavayant.png' },
        { name: 'Bernardo Dominic', image: 'bernardodominic.png' },
        { name: 'Elwin Sharvill', image: 'elwinsharvill.png' },
        { name: 'Ioni Bowcher', image: 'ionibowcher.png' },
        { name: 'Ivan Magalhaes', image: 'ivanmagalhaes.png' },
        { name: 'Onyama Limba', image: 'onyamalimba.png' },
        { name: 'Stephen Shaw', image: 'stephenshaw.png' },
        { name: 'XuXue Feng', image: 'xuxuefeng.png' }
    ];

    const statuses = ['unqualified', 'qualified', 'new', 'negotiation', 'renewal', 'proposal'];

    const clearFilter1 = () => {
        initFilters1();
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
                <Button type="button" icon="pi pi-plus" label="Adicionar" outlined onClick={clearFilter1} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue1} onChange={onGlobalFilterChange1} placeholder="Pesquisar" />
                </span>
            </div>
        );
    };

    useEffect(() => {


        CustomerService.getCustomersLarge().then((data) => {
            setCustomers1(getCustomers(data));
            setLoading1(false);
        });


        initFilters1();
    }, []);

    const getCustomers = (data: Demo.Customer[]) => {
        return [...(data || [])].map((d) => {
            d.date = new Date(d.date);
            return d;
        });
    };

    const formatDate = (value: Date) => {
        return value.toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        });
    };

    const initFilters1 = () => {
        setFilters1({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            name: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }]
            },
            'country.name': {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }]
            },
            representative: { value: null, matchMode: FilterMatchMode.IN },
            date: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }]
            },
            balance: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }]
            },
            status: {
                operator: FilterOperator.OR,
                constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }]
            },
            activity: { value: null, matchMode: FilterMatchMode.BETWEEN },
            verified: { value: null, matchMode: FilterMatchMode.EQUALS }
        });
        setGlobalFilterValue1('');
    };


    const dateBodyTemplate = (rowData: Demo.Customer) => {
        return formatDate(rowData.date);
    };

    const dateFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return <Calendar value={options.value} onChange={(e) => options.filterCallback(e.value, options.index)} dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy" mask="99/99/9999" />;
    };

    const balanceBodyTemplate = (rowData: Demo.Customer) => {
        return formatCurrency(rowData.balance as number);
    };

    const balanceFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return <InputNumber value={options.value} onChange={(e) => options.filterCallback(e.value, options.index)} mode="currency" currency="USD" locale="en-US" />;
    };



    const verifiedBodyTemplate = (rowData: Demo.Customer) => {
        return (
            <i
                className={classNames('pi', {
                    'text-blue-500 pi-check-circle': rowData.verified,
                    'text-pink-500 pi-times-circle': !rowData.verified
                })}
            ></i>
        );
    };

    const actionsFiels = (rowData: Demo.Customer) => {
        return (
            <div className="actionsTable" style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{cursor: 'pointer'}}>
                    <i className="pi pi-eye"></i>
                </div>

                <div style={{cursor: 'pointer', margin: '0px 15px'}}>
                    <i className="pi pi-pencil text-blue-500"></i>
                </div>

                <div style={{cursor: 'pointer'}}>
                    <i className="pi pi-trash text-red-500"></i>
                </div>



            </div>
        );
    };

    const verifiedFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return <TriStateCheckbox value={options.value} onChange={(e) => options.filterCallback(e.value)} />;
    };





    const header1 = renderHeader1();

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <h5>Roles</h5>
                    <DataTable
                        value={customers1}
                        paginator
                        className="p-datatable-gridlines"
                        showGridlines
                        rows={10}
                        dataKey="id"
                        filters={filters1}
                        filterDisplay="menu"
                        loading={loading1}
                        responsiveLayout="scroll"
                        emptyMessage="No customers found."
                        header={header1}
                    >
                        <Column field="name" header="Nome" filter filterPlaceholder="Search by name" style={{ minWidth: '12rem' }} />
                        {/* <Column header="Country" filterField="country.name" style={{ minWidth: '12rem' }} body={countryBodyTemplate} filter filterPlaceholder="Search by country" filterClear={filterClearTemplate} filterApply={filterApplyTemplate} /> */}
                        {/* <Column
                                header="Agent"
                                filterField="representative"
                                showFilterMatchModes={false}
                                filterMenuStyle={{ width: '14rem' }}
                                style={{ minWidth: '14rem' }}
                                body={representativeBodyTemplate}
                                filter
                                filterElement={representativeFilterTemplate}
                            /> */}
                        <Column header="Registro" filterField="date" dataType="date" style={{ minWidth: '10rem' }} body={dateBodyTemplate} filter filterElement={dateFilterTemplate} />
                        <Column header="Gasto" filterField="balance" dataType="numeric" style={{ minWidth: '10rem' }} body={balanceBodyTemplate} filter filterElement={balanceFilterTemplate} />
                        {/* <Column field="status" header="Status" filterMenuStyle={{ width: '14rem' }} style={{ minWidth: '12rem' }} body={statusBodyTemplate} filter filterElement={statusFilterTemplate} /> */}
                        {/* <Column field="activity" header="Activity" showFilterMatchModes={false} style={{ minWidth: '12rem' }} body={activityBodyTemplate} filter filterElement={activityFilterTemplate} /> */}
                        <Column field="verified" header="Verificado" dataType="boolean" bodyClassName="text-center" style={{ minWidth: '8rem' }} body={verifiedBodyTemplate} filter filterElement={verifiedFilterTemplate} />
                        <Column field="verified" header="Ações" dataType="boolean" bodyClassName="text-center" style={{ minWidth: '8rem' }} body={actionsFiels} />
                    </DataTable>
                </div>
            </div>






        </div>
    );
};

export default Roles;
