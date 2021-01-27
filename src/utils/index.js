const countObjectProperties = object => {
  if (typeof object === 'object') {
    return Object.keys(object).length
  }
  return 0
}

const removeEmptyProperties = obj => {
  const objCopy = { ...obj }
  Object.keys(objCopy).forEach(key => {
    if (!objCopy[key]) delete objCopy[key]
  })
  return objCopy
}

export { countObjectProperties, removeEmptyProperties }
