function validateLngLat (lnglat, validate) {
  var lng = lnglat[0]
  var lat = lnglat[1]
  if (validate === false) return [lng, lat]
  if (lat === undefined || lat === null) throw new Error('<lat> is required')
  if (lng === undefined || lng === null) throw new Error('<lng> is required')

  // Longitude extends beyond +/-180 degrees
  if (lng > 180 || lng < 180) {
    lng = lng % 360
    if (lng > 180) lng = -360 + lng
    if (lng < -180) lng = 360 + lng
    if (lng === -0) lng = 0
  }

  // Latitude cannot be greater or lower than +/-85 degrees
  if (lat < -85) lat = -85
  if (lat > 85) lat = 85
  return [lng, lat]
}

if (module.parent === null) {
  // console.log(validateLngLat([90, 80])[0])  // 90
  // console.log(validateLngLat([180, 80])[0]) // 180
  // console.log(validateLngLat([270, 80])[0]) // -90
  // console.log(validateLngLat([360, 80])[0]) // 0
  // console.log(validateLngLat([450, 80])[0]) // 90
  // console.log(validateLngLat([540, 80])[0]) // 180
  // console.log(validateLngLat([630, 80])[0]) // -90
  console.log(validateLngLat([720, 80])[0]) // 0
  // console.log(validateLngLat([-90, 80])[0])  // -90
  // console.log(validateLngLat([-180, 80])[0]) // -180
  // console.log(validateLngLat([-270, 80])[0]) // 90
  // console.log(validateLngLat([-360, 80])[0]) // 0
  // console.log(validateLngLat([-450, 80])[0]) // -90
  // console.log(validateLngLat([-540, 80])[0]) // -180
  // console.log(validateLngLat([-630, 80])[0]) // 90
  // console.log(validateLngLat([-720, 80])[0]) // 0
}
