'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { Button } from 'primereact/button'
import { InputSwitch } from 'primereact/inputswitch'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'

import useDebounce from '../../hooks/useDebounce'
import { BaseURL } from '../../../utils/baseUrl'
import TableComponent from '../common/table/TableComponent'
import GoPrevious from '../common/GoPrevious/GoPrevious'
import { Tag } from 'primereact/tag'
import UpdateCategoryModel from './UpdateCategoryModel'
import { Paginator } from 'primereact/paginator'
import Link from 'next/link'
import UploadCategoryModal from './UploadCategoryModal'

// define your columns: fieldName → header
const columns = {
  name:   'Name',
  isActive: 'Status',
  toggle:   'Toggle',
  action:   'Action'
}

export default function CategoryList() {
  const { token } = useSelector(s => s.authReducer)
  const toast = useRef(null)

  const [data, setData]             = useState([])
  const [loading, setLoading]       = useState(false)
  const [search, setSearch]         = useState('')
  const debouncedSearch             = useDebounce(search, 500)
    const [totalRecords, setTotalRecords] = useState(0);
  const [first, setFirst]           = useState(0)
  const [rows, setRows]             = useState(10)
  const [refreshFlag, setRefreshFlag] = useState(false);
    const [visible, setVisible] = useState(false);

    const [page, setPage] = useState(1);

  // edit dialog
  const [isDialogVisible, setDialogVisible] = useState(false)
  const [editItemId, setEditItemId]         = useState(null)
  const [editName, setEditName]             = useState('')

  // fetch list
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`${BaseURL}/category-list`, {
          params: { name: debouncedSearch, page, limit: rows },
          headers: { Authorization: `Bearer ${token}` } 
          
        })
        if (res.data.success) {
          setData(res.data.data)
                  setTotalRecords(res.data.pagination.total);

        }
      } catch (err) {
        toast.current.show({
          severity: 'error',
          summary: 'Load Error',
          detail: err.message,
          life: 3000
        })
      }
      setLoading(false)
    }
    fetchData()
  }, [debouncedSearch, first, rows,page,refreshFlag])

  // page change (if you wire pagination into TableComponent later)
  const onPage = e => {
    setFirst(e.first)
    setRows(e.rows)
  }

  // toggle active status
  const toggleStatus = async item => {
    const updated = { ...item, isActive: !item.isActive }
    setData(d => d.map(x => x._id === item._id ? updated : x))

    try {
      const res = await axios.put(
        `${BaseURL}/category`,
        { id: item._id, isActive: updated.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      toast.current.show({
        severity: updated.isActive ? 'success' : 'warn',
        summary:   updated.isActive ? 'Activated' : 'Disabled',
        detail:    res.data.message,
        life:      2000
      })
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary:  'Error',
        detail:   err.response?.data?.message || err.message,
        life:     3000
      })
    }
  }

  // open edit dialog
  const openEdit = item => {
    setEditItemId(item._id)
    setEditName(item.name)
    setDialogVisible(true)
  }

    const onPageChange = (event) => {
    setPage(event.page + 1);
    setRows(event.rows);
  };
  // save update
  const updateCategory = async () => {
    try {
      const res = await axios.put(
        `${BaseURL}/category/update`,
        { id: editItemId, name: editName },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setData(d =>
        d.map(x =>
          x._id === editItemId ? { ...x, name: editName } : x
        )
      )
      toast.current.show({
        severity: 'success',
        summary:  'Updated',
        detail:   res.data.message,
        life:     2000
      })
      setDialogVisible(false)
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary:  'Error',
        detail:   err.response?.data?.message || err.message,
        life:     3000
      })
    }
  }

  // delete (client-side only)
  const confirmDelete = id => {
    setData(d => d.filter(x => x._id !== id))
    toast.current.show({
      severity: 'info',
      summary:  'Deleted',
      detail:   'Category removed',
      life:     2000
    })
  }

  // render each cell
  const renderColumnBody = (field, item) => {
    switch (field) {
      case 'name':
        return <Link
                    style={{ color: "#337ab7" }}
                    href={`/system-setup/category/sub-category/${item?._id}`}
                  >
                    <div className="flex gap-3 justify-start items-center">
                        {item?.name}
                    </div>
                  </Link> 
      case 'isActive':
        return (
          <Tag
            value={item.isActive ? 'Active' : 'Disabled'}
            severity={
              item.isActive
                ? 'success'
                : 'danger'
            }
            // onClick={() => toggleStatus(item)}
          />
        )

      case 'toggle':
        return (
          <InputSwitch
            checked={item.isActive}
            onChange={() => toggleStatus(item)}
          />
        )

      case 'action':
        return (
          <div className="flex gap-2">
            <Button
              icon="pi pi-pencil"
              className="p-button-text p-button-sm"
              onClick={() => openEdit(item)}
            />
            <Button
              icon="pi pi-trash"
              className="p-button-text p-button-sm p-button-danger"
              onClick={() => confirmDelete(item._id)}
            />
          </div>
        )

      default:
        return null
    }
  }

    const handleRefresh = () => {
    setRefreshFlag((prevFlag) => !prevFlag);
  };

  return (
    <div className="p-8">
      <Toast ref={toast} />

      {/* search + add */}
      <div className="flex justify-between mb-4">
            <div className="flex gap-4">
                <GoPrevious route={"/system-setup/"} />
                <h2 className="text-xl font-semibold">
            Categories
          </h2>
              </div>

     <div className="flex justify-between mb-4 gap-4">
         <div className="">
          <InputText
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          className="p-inputtext-sm"
        />
        </div>
        <div className="">
  
           <UpdateCategoryModel
                    title={`Add New Category`}
                    parent={null}
                    fetchDataList={handleRefresh}
                  />
        </div>
        <div className="">
          <Button label="Upload CSV" icon="pi pi-upload" onClick={() => setVisible(true)} />
      <UploadCategoryModal visible={visible} onHide={() => setVisible(false)} /> 
        </div>
     </div>
      </div>

      {/* your Depot-style table */}
      <TableComponent
        tableName="category"
        columns={columns}
        data={data}
        loading={loading}
        renderColumnBody={renderColumnBody}
        // if you ever need row-selection, flip this on:
        isSelection={false}
        onSelectionChange={() => {}}
      />
 <Paginator
            first={(page - 1) * rows}
            rows={rows}
            totalRecords={totalRecords}
            rowsPerPageOptions={[5, 10, 25, 50]}
            onPageChange={onPageChange}
            template="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            currentPageReportTemplate="{first} to {last} of {totalRecords}"
          />
      {/* edit dialog */}
      <Dialog
        header="Update Category"
        visible={isDialogVisible}
        style={{ width: '350px' }}
        modal
        onHide={() => setDialogVisible(false)}
      >
        <div className="flex flex-col gap-2">
          <label>Name</label>
          <InputText
            value={editName}
            onChange={e => setEditName(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            label="Cancel"
            icon="pi pi-times"
            className="p-button-text"
            onClick={() => setDialogVisible(false)}
          />
          <Button
            label="Save"
            icon="pi pi-check"
            className="p-button-sm p-button-success"
            onClick={updateCategory}
          />
        </div>
      </Dialog>
    </div>
  )
}
