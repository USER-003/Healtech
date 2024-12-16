module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      //No borrar las lineas comentadas
      // ['@babel/plugin-transform-class-properties', { loose: true }],
      // ['@babel/plugin-transform-private-methods', { loose: true }],
      // ['@babel/plugin-transform-private-property-in-object', { loose: true }],
      // '@babel/plugin-transform-modules-commonjs',
      'react-native-reanimated/plugin', // Siempre debe ir al final
    ],
  };
};
