<template>
   
        <div class="content">
            <v-row class="top-bar">
                <span class="name-file" v-if="fileName">Nom: {{ this.fileName }}</span>
                
                <vb-btn 
                    flat
                    class="btn-closed"
                    @click="closeDialog"
                >
                    Fermer
                </vb-btn>

               
            </v-row>
                <!-- Affichage de l'image -->
            <div v-if="show[0].image.show">
                <div class="image-vue">
                    <span :class="loader ? 'loader' : ''"></span>
                 
            <img :src="show[0].image.url" alt="" srcset="">
                </div>
            </div>
            <!-- Affichage du fichier pdf -->
            <div v-if="show[0].pdf.show" style="width: 100%; height: 100%;">
               
                <div class="pdf-vue">
                    <VuePdfApp  style="height: 100%; width: 100%;" :pdf="show[0].pdf.url" />
                </div>
            </div>
            <!-- Affichage des données du fichier excel -->
             <div v-if="show[0].excel.show" class="excel-vue">
                <table>
                    <thead>
                        <tr>
                            <th v-for="header in headersTableExcel">{{ header }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in tableExcelData">
                            <td v-for="cell in row">{{ cell }}</td>
                        </tr>
                    </tbody>
                </table>
             </div>
             <div v-if="show[0].movie.show" class="movie-vue">
                    <video :src="show[0].movie.url" controls > </video>
             </div>
        </div>
  
</template>

<script lang="ts">

import { url } from 'inspector';
import { ActionTypes } from '../interfaces/vuexStoreTypes';
// import pdf from 'vue-pdf-embed/dist/vue2-pdf-embed';
// import VuepdfEmbed from 'vue-pdf-embed/dist/vue2-pdf-embed';
import VuePdfApp from 'vue-pdf-app'
import "vue-pdf-app/dist/icons/main.css";
import {read, utils } from 'xlsx';
    export default {
        name: 'ShowDocumentation',
        components: {
            // VuepdfEmbed,
            VuePdfApp,
        },
        props: {
            file_prop : {
                type: String,
                required: true,
            },
            referenceId: {
                type: Number,
                required: true,
            },
        },
        data() {
            return {
                fileName : '',
                url_init: '',
                numPages: 0,
                curentpage: 1,
                loader: true,
                headersTableExcel: [],
                tableExcelData: [],
                show :[ {
                    pdf: {
                        show: false,
                        url: '',
                    },
                    image: {
                        show: false,
                        url: '',    
                    },
                    excel: {
                        show: false,
                        url: '',
                    },
                    movie: {
                        show: false,
                        url: '',
                    }
                }]
            };
        },
       watch: {
          
            referenceId: async function  (val){
            this.fileName = this.file_prop;
            this.fileName = this.fileName.replace(/\.[^/.]+$/, "");
            const fileExtension = this.file_prop.split('.').pop();
            console.log('fileName: ', this.fileName)
                const buildingId = localStorage.getItem("idBuilding");
                this.referenceId = val;
                const file = [this.$store.dispatch(ActionTypes.GET_FILE, {
                    buildingId: buildingId,
                    referenceId: this.referenceId,
                })]
                const result = await Promise.all(file)
                let type = ""
                result.forEach((blob) =>{
                     type = blob.type.split('/')[1]
                    this.url_init = window.URL.createObjectURL(blob)
                })
                this.showFile(fileExtension, this.url_init) 
                this.loader = false;
            },
            url : function (val){
            }
        },
        mounted() {
            this.curentpage = 1;
        },
        methods: {
            closeDialog() {
                this.dialog = !this.dialog;
                this.$emit('closeDialog', this.dialog);
            },
            handleDocumentload(event) {  
                this.numPages = event.numPages;
            

            },

            showFile(type: string, url: string){
                console.log('type: ', type)
               this.show.map(async (item, index)=> {
                    if(type === 'pdf'){
                        item.pdf.show = true;
                        item.pdf.url = url;
                        item.excel.show = false;
                        item.image.show = false; 
                        
                    
                    }else if(type === 'png' || type === 'jpeg' || type === 'jpg'){
                        item.image.show = true;
                        item.image.url = url;
                        item.pdf.show = false;  
                        item.excel.show = false;

                    } else if(type === 'mp4' || type === 'mkv' || type === 'ogg' || type === 'avi' || type === 'mov' || type === 'flv' || type === 'wmv'){
                        item.movie.show = true;
                        item.movie.url = url;
                        item.pdf.show = false;
                        item.image.show = false;
                        item.excel.show = false;
                    }
                    
                    
                    else if(type === 'xlsx' || type === 'xls'){
                        item.pdf.show = false;
                        item.image.show = false;
                        item.excel.show = true;
                        item.movie.show = false;
                        this.tableExcelData = [];
                        this.headersTableExcel = [];
                        item.excel.url = url;
                        const data = await fetch(url)
                        const ab = await data.arrayBuffer()
                        const wb = read(ab, {type: 'array'})
                        
                        const load = utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
                       load.forEach((row, index) => {
                            if(index === 0){
                                 this.headersTableExcel = Object.keys(row)
                                 console.log('headers: ', this.headersTableExcel)
                            }
                            this.tableExcelData.push(Object.values(row))
                            console.log('tableExcelData: ', this.tableExcelData)
                        })
                       

                    }
                    console.log('item: ', item)
               })
            }
        }
    }

</script>

<style>

    .top-bar {
        width: 100%;
        height: max-content;
        display: flex;
        justify-content: space-between;
        position: relative;
    }
   
       .content {
        width: 100%;
        height: calc(100% - 10px);
        padding: 30px;
        display: flex;
        background-color: #ffffff;
        flex-direction: column;
        position: relative;
        overflow: hidden;
        overflow-y: auto;
    }

    .name-file {
        font-size: 16px;
        height: max-content;
        font-weight: 700;
        color: #14202C;
        letter-spacing: 1.5px;
        padding: 8px;
        border-radius: 10px;
        top: 4px;
        right: 100px;
        background-color: #f1f1f1;
        font-family: 'Roboto', sans-serif;
    }
    .close {
        position: absolute !important;
        top: 10px !important;
        right: 8px !important;
        cursor: pointer;
        color: rgb(0, 0, 0) !important;
        padding: 5px !important;
        border-radius: 50% !important;
        background-color: rgba(184, 179, 179, 0.671) !important;
    }
    .pdf-vue {
        width: 100%;
        height: 100%;
        overflow: hidden;
        background-color: #f1f1f1;
        padding: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow-y: scroll;
        border-radius: 10px;
    }
.pdf-vue::-webkit-scrollbar {
    width: 12px; 
    height: 9px; 
}

.pdf-vue::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px; 
}

.pdf-vue::-webkit-scrollbar-thumb {
    background-color: #0c0c0c ;  
    border-radius: 10px;        
}

.pdf-vue::-webkit-scrollbar-thumb:hover {
    background-color: #555;  
}

    .image-vue {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        overflow-y: auto;
    }
    .image-vue img {
        width: calc(100% - 40px); 
        height: calc(100% - 40px);
        object-fit: cover;
        border-radius: 10px;
        overflow: hidden
    }
    .excel-vue{
        width: 100%;
        height: calc(100vh - 200px);
        overflow: hidden;
        padding: 20px;
        margin-top:  10px;
        overflow-y: auto;
    }
    .excel-vue table {
        width: 100%;
        border-collapse: collapse;
    }
    .excel-vue table thead {
        background-color: #14202C;
        color: #fff;
    }
    .excel-vue table thead th {
        padding: 10px;
        text-align: left;
        border-left: #e7e7e7c9 1px solid;
    }
    .excel-vue table tbody tr {
        border-bottom: 1px solid #14202C;
        border-left: 1px solid #14202C;
    }
    .excel-vue table tbody tr td {
        padding: 10px;
        text-align: left;
        border-left: 1px solid #14202C;

    }
    .movie-vue {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        overflow-y: auto;
    }
    .movie-vue video {
        width: calc(100% - 40px); 
        height: calc(100% - 40px);
        object-fit: cover;
        border-radius: 10px;
        overflow: hidden;
    }
    .btn-closed {
        height: max-content;
        cursor: pointer;
        color: #fff;
        padding: 8px;
        font-size: 16px;
        border-radius: 10px;
        font-weight: 700;
        background-color: #14202C;
    }
   
.loader {
  width: 50px;
  --b: 8px; 
  aspect-ratio: 1;
  border-radius: 50%;
  padding: 1px;
  background: conic-gradient(#0000 10%,#f03355) content-box;
  -webkit-mask:
    repeating-conic-gradient(#0000 0deg,#000 1deg 20deg,#0000 21deg 36deg),
    radial-gradient(farthest-side,#0000 calc(100% - var(--b) - 1px),#000 calc(100% - var(--b)));
  -webkit-mask-composite: destination-in;
          mask-composite: intersect;
  animation:l4 1s infinite steps(10);
}
@keyframes l4 {to{transform: rotate(1turn)}}
</style>