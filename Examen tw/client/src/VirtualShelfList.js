import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { FilterMatchMode } from 'primereact/api'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
//import { SERVER } from "./global";
const SERVER = "http://localhost:8080"

function VirtualShelfsList(props) {
    const navigate = useNavigate()

    const [isDialogShown, setIsDialogShown] = useState(false)
    const [virtualShelf, setVirtualShelf] = useState([])
    const [content, setContent] = useState('')
    const [date, setDate] = useState('')
    const [isNewRecord, setIsNewRecord] = useState(true)
    const [count, setCount] = useState(0)
    const [sortField, setSortField] = useState('')
    const [sortOrder, setSortOrder] = useState(1)
    const [selectedVirtualShelf, setSelectedVirtualShelf] = useState(null)
    const [filterString, setFilterString] = useState('')
    const [filters, setFilters] = useState({
        content: { value: null, matchMode: FilterMatchMode.CONTAINS },
        date: { value: null, matchMode: FilterMatchMode.CONTAINS }

    })


    const [page, setPage] = useState(0)
    const [first, setFirst] = useState(0)

    const getVirtualShelf = async (filterString, page, pageSize, sortField, sortOrder) => {
        const response = await fetch(`${SERVER}/virtualShelfs?${filterString}&sortField=${sortField || ''}&sortOrder=${sortOrder || ''}&page=${page || ''}&pageSize=${pageSize || ''}`)
        const data = await response.json()
        setVirtualShelf(data.records)
        setCount(data.count)
    }

    const addVirtualShelf = async (virtualShelf) => {
        await fetch(`${SERVER}/virtualShelfs`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify()
        })
        getVirtualShelf(filterString, page, 2, sortField, sortOrder)
    }

    const editVirtualShelf = async (virtualShelf) => {
        console.log(virtualShelf);
        await fetch(`${SERVER}/virtualShelf/${virtualShelf.selectedVirtualShelf}`, {
            method: 'put',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(virtualShelf)
        })
        getVirtualShelf(filterString, page, 2, sortField, sortOrder)
    }

    const deleteVirtualShelf = async (virtualShelf) => {
        await fetch(`${SERVER}/virtualShelfs/${virtualShelf}`, {
            method: 'delete',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        getVirtualShelf(filterString, page, 2, sortField, sortOrder)
    }

    useEffect(() => {
        getVirtualShelf(filterString, page, 2, sortField, sortOrder)
    }, [filterString, page, sortField, sortOrder])

    const handleFilter = (evt) => {
        const oldFilters = filters
        oldFilters[evt.field] = evt.constraints.constraints[0]
        console.log(oldFilters);
        setFilters({ ...oldFilters })
    }

    useEffect(() => {
        const keys = Object.keys(filters)
        const computedFilterString = keys.map(e => {
            return {
                key: e,
                value: filters[e].value
            }
        }).filter(e => e.value).map(e => `${e.key}=${e.value}`).join('&')
        setFilterString(computedFilterString)
    }, [filters])

    const handleFilterClear = (evt) => {
        setFilters({
            content: { value: null, matchMode: FilterMatchMode.CONTAINS },
            date: { value: null, matchMode: FilterMatchMode.CONTAINS }
        })
    }

    const handleAddClick = (ev) => {


        setIsDialogShown(true)
        setIsNewRecord(true)
        setContent('')
        setDate('')
    }

    const handleSaveClick = () => {
        if(isNewRecord){
            addVirtualShelf({content,date})
        }else{
            editVirtualShelf({selectedVirtualShelf,content, date})
        }
        setIsDialogShown(false)
        setSelectedVirtualShelf(null)
        setContent('')
        setDate('')
    }

    const tableFooter = (
        <div>
            <Button label='Add' icon='pi pi-plus' onClick={handleAddClick} />
        </div>
    )

    const dialogFooter = (
        <div>
            <Button label='Save' icon='pi pi-save' onClick={handleSaveClick} />
        </div>
    )

    const handleEditVirtualShelf = (rowData) => {
        setSelectedVirtualShelf(rowData.id)
        setContent(rowData.content)
        setDate(rowData.date)
        
        setIsDialogShown(true)
        setIsNewRecord(false)
      }

    const handleDelete = (rowData) => {
        setSelectedVirtualShelf(rowData.id)
        deleteVirtualShelf(rowData.id)
    }  


    const opsColumn = (rowData) => {
        return (
            <>
                <Button label='Edit' icon='pi pi-pencil' onClick={()=>handleEditVirtualShelf(rowData)}/>
                <Button label='Delete' icon='pi pi-times' className='p-button p-button-danger' onClick={()=>handleDelete(rowData)} />
                <Button label='Books' className='p-button p-button-success' onClick={() => navigate(`/${rowData.id}/books`)} />

            </>
        )
    }

    const handlePageChange = (evt) => {
        setPage(evt.page)
        setFirst(evt.page * 2)
    }

    const handleSort = (evt) => {
        console.warn(evt)
        setSortField(evt.sortField)
        setSortOrder(evt.sortOrder)
    }

    const hideDialog = () => {
        setIsDialogShown(false)
    }

    return (
        <div>
            {/* {
                virtualShelfs.map(e => <VirtualShelf key={e.id} item={e} />)
            } */}
            <DataTable
                value={virtualShelf}
                footer={tableFooter}
                lazy
                paginator
                onPage={handlePageChange}
                first={first}
                rows={2}
                totalRecords={count}
                onSort={handleSort}
                sortField={sortField}
                sortOrder={sortOrder}
            >
                <Column header='Content' field='content' filter filterField='content' filterPlaceholder='filter by content' onFilterApplyClick={handleFilter} onFilterClear={handleFilterClear} sortable />
                <Column header='Date' field='date' />
                <Column body={opsColumn} />
            </DataTable>
            <Dialog header='A book' visible={isDialogShown} onHide={hideDialog} footer={dialogFooter}>
                <div>
                    <InputText placeholder='content' onChange={(evt) => setContent(evt.target.value)} value={content} />
                </div>
                <div>
                    <InputText placeholder='date' onChange={(evt) => setDate(evt.target.value)} value={date} />
                </div>
            </Dialog>

        </div>

    );
}

export default VirtualShelfsList;
