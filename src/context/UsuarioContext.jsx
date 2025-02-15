import { createContext, useEffect, useState } from "react";
import axios from "axios";
//import { API_URL } from "../config";

export const UsuarioContext = createContext();

const token = localStorage.getItem('token');

export function UsuariosContextProvider(props) {

      const [usuarios, setUsuarios] = useState([]);
      const [comentarios, setComentarios] = useState([]);
      const [autenticacion, setAutenticacion] = useState({});
      const [usuarioAutenticado, setUsuarioAutenticado] = useState({});
      const [mensajePublicado, setMensajePublicado] = useState(false)
      const [misReservacionesAventura, setMisReservacionesAventura] = useState([]);
      const [misReservacionesCabaña, setMisReservacionesCabaña] = useState([]);
      const [misReservaciones, setMisReservaciones] = useState([]);
      const API_URL = import.meta.env.VITE_REACT_APP_API_URL

      console.log(misReservacionesAventura)
      console.log(misReservacionesCabaña)


      useEffect(() => {

            // axios.get(`${API_URL}/api/usuarios/${1}`)
            //       .then(e => console.log(e.data))
            //       .catch(e => console.log(e))

            //Obtener los comentarios de los usuarios
            axios.get(`${API_URL}/api/usuarios-opinions/`)
                  .then(e => setComentarios(e.data.comments))
                  .catch(e => console.log(e))

            //Verificar si el usuario está autenticado
            axios.get(`${API_URL}/api/verificar-sesion/`, {

                  headers: {

                        Authorization: `${token}`
                  }
            })
                  .then(e => setUsuarioAutenticado(e.data.usuario))
                  .catch(e => console.log(e))

      }, [mensajePublicado]);

      useEffect(() => {

            if ((usuarioAutenticado)) {

                  axios.get(`${API_URL}/api/reservaciones-aventura/${usuarioAutenticado.id}/`)
                        .then(e => setMisReservacionesAventura(e.data.reservaciones))
                        .catch(e => console.log(e))



                  axios.get(`${API_URL}/api/reservaciones-cabaña/${usuarioAutenticado.id}`)
                        .then(e => setMisReservacionesCabaña(e.data.reservaciones))
                        .catch(e => console.log(e))
            }

      }, [usuarioAutenticado])

      useEffect(() => {

            // Vamos a ordenar ambos arreglos
            //const arregloOrdenado = [...misReservacionesCabaña, ...misReservacionesAventura];

            function renombrarClaves(objeto, mapeo) {
                  return Object.fromEntries(
                        Object.entries(objeto).map(([clave, valor]) => [mapeo[clave] || clave, valor])
                  );
            }

            // Aplicamos la función de mapeo a cada elemento de los arreglos
            const nuevoArray1 = misReservacionesCabaña.map(elemento => renombrarClaves(elemento, {
                  apellido_de_usuario: 'apellido_usuario',
                  fecha_de_estancia: 'fecha_servicio',
                  nombre_cabaña: 'nombre_servicio',
                  precio_cabaña: 'precio_servicio'
            }));

            const nuevoArray2 = misReservacionesAventura.map(elemento => renombrarClaves(elemento, {
                  apellido_usuario: 'apellido_usuario',
                  fecha_aventura: 'fecha_servicio',
                  nombre_aventura: 'nombre_servicio',
                  precio_aventura : 'precio_servicio'
            }));

            const arregloOrdenado = [...nuevoArray1, ...nuevoArray2];            
            setMisReservaciones(arregloOrdenado);


      }, [misReservacionesCabaña, misReservacionesAventura]);

      const publicarComentario = comentario => {

            // Le enviaremos el cuerpo y el token para autenticar si el usuario ha iniciado sesión
            return axios.post(`${API_URL}/api/usuarios-opinions/`, comentario, {

                  headers: {

                        Authorization: `${token}`
                  },

            })

                  .then(e => {

                        console.log(e.data)
                        console.log(token)

                        return e

                  })
                  .catch(error => {

                        return error
                  })

      }

      const autenticarUsuario = credenciales => {

            return axios.post(`${API_URL}/api/usuarios/`, credenciales)

                  .then(e => {

                        return e.data

                  })
                  .catch(error => {

                        if (error.message) {

                              if (error.response.status === 200) {

                                    return 'Credenciales incorrectas. Por favor, inténtalo de nuevo.'

                              } else if (error.response.status === 201) {

                                    return "Credenciales incorrectas. Por favor, inténtalo de nuevo."

                              } else {

                                    return 'Error de respuesta del servidor:', error.response.status, error.response.data;
                              }

                        } else if (error.request) {

                              return 'Error de solicitud sin respuesta:', error.request;

                        } else {

                              return 'Error de configuración de la solicitud:', error.message;
                        }

                  });

      }

      return (

            <UsuarioContext.Provider value={{

                  comentarios: comentarios,
                  autenticarUsuario: autenticarUsuario,
                  publicarComentario,
                  usuarioAutenticado,
                  mensajePublicado,
                  setMensajePublicado,
                  misReservacionesAventura,
                  misReservacionesCabaña,
                  misReservaciones

            }}>

                  {props.children}

            </UsuarioContext.Provider>


      )

}
