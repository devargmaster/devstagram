<script>
import MainH1 from '../components/MainH1.vue';
import MainLabel from '../components/MainLabel.vue';
import MainButton from '../components/MainButton.vue';
import { updateUserPhoto } from '../services/auth';

export default {
  name: 'MyProfileEditPhoto',
  components: {MainH1, MainLabel, MainButton},
  data() {
    return {
      photo: null,
      photoPreview: null,
      uploadingPhoto: false,
    }
  },
  methods: {
    handleFileSelection(event) {
      // ¿Cómo obtenemos el valor de un <input type="file">?
      // Los inputs de este tipo tienen una propiedad "files" que podemos usar para acceder a su valor.
      // "files" contiene un objeto FileList. FileList es esencia un array de objetos File.
      // File es, a su vez, la clase que representa un archivo.
      // Siempre "files" va a tener un FileList. Incluso si solo hay un único archivo seleccionado.
      // En ese caso, podemos hardcodear la posición 0 del array.
      this.photo = event.target.files[0];
      // console.log("Files: ",  event.target.files);

      // A partir de ese File que capturamos vamos a buscar leer el contenido del archivo para poder mostrar una
      // previsualización de la imagen.
      // Para leer un archivo necesitamos usar la clase FileReader.
      const reader = new FileReader();

      // Escuchamos el evento "load" que se dispara cuando se termina de leer un archivo.
      // A través de este evento nos enteramos de cuándo tenemos disponible el contenido.
      // Dicho contenido va a estar disponible a través de la propiedad "result" del FileReader.
      reader.addEventListener('load', () => {
        // console.log("Contenido del archivo: ", reader.result);
        this.photoPreview = reader.result;
      });

      // Pedimos leer el archivo con un formato de "data URL".
      // "Data URL" es un formato que utiliza el protocolo "data:" para poder vincular un archivo como un string
      // en base64, que podamos usar en reemplazo de una ruta convencional.
      reader.readAsDataURL(this.photo);
    },
    handleFileUpload() {
      this.uploadingPhoto = true;
      try {
        // Upload del archivo.
        updateUserPhoto(this.photo);
      } catch (error) {
        // TODO: Manejar el error
      }
      this.uploadingPhoto = false;
    }
  }
}
</script>

<template>
  <MainH1>Editar mi Foto de Perfil</MainH1>

  <form
    action="#"
    class="flex gap-4"
    @submit.prevent="handleFileUpload"
  >
    <div class="w-1/2">
      <div class="mb-3">
        <MainLabel for="photo">Foto</MainLabel>
        <input
          type="file"
          id="photo"
          class="w-full p-2 border border-gray-300 rounded disabled:bg-gray-100"
          :read-only="uploadingPhoto"
          @change="handleFileSelection"
        >
      </div>
      <MainButton>Actualizar</MainButton>
    </div>
    <div class="w-1/2">
      <h2 class="mb-3">Previsualización de la Foto Seleccionada</h2>
      <img
        v-if="photoPreview != null"
        :src="photoPreview"
        alt=""
      >
    </div>
  </form>
</template>
