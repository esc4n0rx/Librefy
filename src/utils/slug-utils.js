const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // remove caracteres especiais
      .trim()
      .replace(/\s+/g, '-') // substitui espaços por hífens
      .replace(/-+/g, '-'); // remove hífens duplicados
  };
  
  module.exports = {
    generateSlug
  };