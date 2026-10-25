
  function setStatus(message) { return message; }
  function set(id, value) {return 'No disponible'; }




  function reverseGeocode(lat, lon) {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.search = new URLSearchParams({
      format: 'jsonv2', lat: String(lat), lon: String(lon),
      zoom: '18', addressdetails: '1', 'accept-language': 'es'
    }).toString();
    return fetch(url, { headers: { 'Accept': 'application/json' } })
      .then(response => {
        if (!response.ok) throw new Error('El servicio de direcciones respondió con error HTTP ' + response.status);
        return response.json();
      });
  }

  function findDistrict(a) {
    return a.city_district || a.district || a.suburb || a.borough ||
      a.municipality || a.county || a.city || a.town || a.village || a.hamlet || '';
  }

  function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const accuracy = position.coords.accuracy;
    set('lat', lat.toFixed(6));
    set('lon', lon.toFixed(6));
    set('accuracy', `± ${Math.round(accuracy)} metros`);
    map.setView([lat, lon], 17);
    if (marker) marker.remove();
    marker = L.marker([lat, lon]).addTo(map).bindPopup('Ubicación aproximada del dispositivo').openPopup();
    lastData = { latitud: lat, longitud: lon, precision_metros: Math.round(accuracy) };
    $('copy').disabled = false;
    setStatus('Coordenadas obtenidas. Buscando la dirección aproximada…');
  }


function obtenerGeolocalizacion() {
  return new Promise((resolve, reject) => {
    
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      // console.log("Latitud:", lat);
      // console.log("Longitud:", lon);

      reverseGeocode(lat, lon).then(data => {
        const a = data.address || {};
        const district = findDistrict(a);
        const city = a.city || a.town || a.village || a.municipality || a.hamlet || '';
        const street = a.road || a.pedestrian || a.residential || a.footway || a.path || '';
        const number = a.house_number || a.building || '';
        

        // console.log(a)
        // set('municipalidad', a.pedestrian);
        // console.log('municipalidad', a.house_number);


        //  set('municipalidad', a.street);



        set('region', a.state || a.region || a.state_district);
        // console.log('provinciaOL', a.region);

        set('district', district);
        set('city', city);
        set('street', street);
        set('number', number);
        set('full', data.display_name);

        const golocalizacion = {
          pais: a.country,
          distrito: city,
          provincia: a.region,
          coordenadasY: lat,
          coordenadasX: lon,
          street:street
        };
        var pais = golocalizacion['pais']
        var latitudY = golocalizacion['coordenadasY'];
         var longitudX  = golocalizacion['coordenadasX'];
        var distrito = golocalizacion['distrito'];
        var provincia = golocalizacion['provincia'];
        var distrito = golocalizacion['distrito'];
        var streets = golocalizacion['street'];

        console.log (pais)

        // Guardamos los datos extendidos en lastData
        lastData = {
          latitud: lat,
          longitud: lon,
          precision_metros: Math.round(position.coords.accuracy),
          pais: a.country || '', 
          region: a.state || a.region || a.state_district || '',
          distrito: district, 
          ciudad: city, 
          calle: street, 
          numero: number, 
          direccion_completa: data.display_name || '' 
        };
        
        setStatus('¡Ubicación encontrada! La dirección es aproximada y puede variar según los datos del mapa.');

        // =================================================================
        // AQUÍ SE RETORNA EL ARRAY CON LOS ELEMENTOS QUE NECESITAS
        // =================================================================
        resolve([distrito, golocalizacion]);

      }).catch(error => {
        setStatus('Se obtuvieron las coordenadas, pero no se pudo consultar la dirección: ' + error.message);
        reject(error);
      });

    }, (errorGeo) => {
      setStatus('Error al obtener la geolocalización del dispositivo: ' + errorGeo.message);
      reject(errorGeo);
    });

  });
}



async function geolocalizacionLocal() {
  try {
    // Desestructuras los dos elementos directamente del array
    const [distrito] = await obtenerGeolocalizacion();
    
    // console.log("distrito:", distrito);
    // console.log("Objeto 'golocalizacion' obtenido:",  );
    // return distrito

  } catch (error) {
    console.error("Algo falló en la geolocalización:", error);
  }
}



geolocalizacionLocal();



// // alert('hola')

// console.log('hola mundo')
// alert('hola');