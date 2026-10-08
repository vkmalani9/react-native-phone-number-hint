module.exports = {
  dependency: {
    platforms: {
      android: {
        sourceDir: './android',
        packageImportPath:
          'import com.vkmalani.phonenumberhint.PhoneNumberHintPackage;',
        packageInstance: 'new PhoneNumberHintPackage()',
      },
      ios: null,
    },
  },
};
