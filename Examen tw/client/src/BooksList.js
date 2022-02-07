import {useParams} from 'react-router-dom'
import React, {useState, useEffect} from 'react';
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
//import { SERVER } from "./global";
const SERVER = "http://localhost:8080"
function BooksList(props) {
    
    // articleID
    const {id} = useParams()
    
    const [isDialogShown, setIsDialogShown] = useState(false)
    const [books, setBooks] = useState([])
    const [title, setTitle] = useState('')
    const [genre, setGenre] = useState('')
    const [url, setUrl] = useState('')
    const [selectedBook, setSelectedBook] = useState(null)
    const [isNewRecord, setIsNewRecord] = useState(true)

    const getBooks = async () => {
        const response = await fetch(`${SERVER}/virtualShelfs/${id}/books`)
        const data = await response.json()
        setBooks(data)
    }

    const addBook = async (book) => {
        await fetch(`${SERVER}/virtualShelfs/${id}/books`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(book)
        })
        getBooks()

    }

    const editBook = async (book) => {
        await fetch(`${SERVER}/virtualShelfs/${id}/books/${book.selectedBook}`, {
            method: 'put',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(book)
        })
        getBooks()
    }

    const deleteBook = async (book) => {
        await fetch(`${SERVER}/virtualShelfs/${id}/books/${book}`, {
            method: 'delete',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        getBooks()
    }

    useEffect(() => {
        getBooks()
    })

    const handleAddClick = (ev) => {
        setIsDialogShown(true)
        setIsNewRecord(true)
        setTitle('')
        setGenre('')
        setUrl('')
    }

    const handleSaveClick = () => {
        if(isNewRecord){
            addBook({title, genre, url})
        }else{
            editBook({selectedBook,title, genre, url})
        }
        setIsDialogShown(false)
        setSelectedBook(null)
        setTitle('')
        setGenre('')
        setUrl('')
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

    const handleEditBook = (rowData) => {
        setSelectedBook(rowData.id)
        setTitle(rowData.title)
        setGenre(rowData.genre)
        setUrl(rowData.url)
        
        setIsDialogShown(true)
        setIsNewRecord(false)
      }

    const handleDelete = (rowData) => {
        console.log(rowData.id);
        
        setSelectedBook(rowData.id)
        deleteBook(rowData.id)
    }  


    const opsColumn = (rowData) => {
        return (
            <>
                <Button label='Edit' icon='pi pi-pencil' onClick={()=>handleEditBook(rowData)}/>
                <Button label='Delete' icon='pi pi-times' className='p-button p-button-danger' onClick={()=>handleDelete(rowData)} />

            </>
        )
    }

    const hideDialog = () => {
        setIsDialogShown(false)
    }

    return (
      <div>
          <DataTable
                value={books}
                footer={tableFooter}
                lazy
                rows={2}
            >
                <Column header='Title' field='title' />
                <Column header='Genre' field='genre' />
                <Column header='Url' field='url' />
                <Column body={opsColumn} />
            </DataTable>
            <Dialog header='A book' visible={isDialogShown} onHide={hideDialog} footer={dialogFooter}>
                <div>
                    <InputText placeholder='title' onChange={(evt) => setTitle(evt.target.value)} value={title} />
                </div>
                <div>
                    <InputText placeholder='genre' onChange={(evt) => setGenre(evt.target.value)} value={genre} />
                </div>
                <div>
                    <InputText placeholder='url' onChange={(evt) => setUrl(evt.target.value)} value={url} />
                </div>
            </Dialog>
      </div>
  
      );
  }
  
  export default BooksList;
  