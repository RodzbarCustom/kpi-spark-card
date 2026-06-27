// Mock minimo de powerbi-visuals-utils-formattingmodel (publicado como ESM, que o
// Jest nao transforma em node_modules). Reproduz apenas o necessario: cada slice
// guarda suas opcoes (incl. .value) para os renderers lerem como no runtime real.

class Slice {
    constructor(o) { Object.assign(this, o); }
}
class ColorPicker extends Slice {}
class ToggleSwitch extends Slice {}
class NumUpDown extends Slice {}
class ItemDropdown extends Slice {}
class TextInput extends Slice {}
class FontPicker extends Slice {}
class FontControl {
    constructor(o) { Object.assign(this, o); }
}
class SimpleCard {}
class Model {}

const formattingSettings = {
    SimpleCard,
    Model,
    ColorPicker,
    ToggleSwitch,
    NumUpDown,
    ItemDropdown,
    TextInput,
    FontControl,
    FontPicker,
};

// Servico nao usado nos testes, mas exportado por compatibilidade.
class FormattingSettingsService {
    populateFormattingSettingsModel(C) { return new C(); }
    buildFormattingModel() { return { cards: [] }; }
}

module.exports = { formattingSettings, FormattingSettingsService };
