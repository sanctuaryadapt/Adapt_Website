
(async () => {
    try {
        const pathModule = await import('path');
        console.log('pathModule keys:', Object.keys(pathModule));
        console.log('pathModule.default:', pathModule.default);
        console.log('pathModule.join:', pathModule.join);

        const fsModule = await import('fs/promises');
        console.log('fsModule keys:', Object.keys(fsModule));
        console.log('fsModule.default:', fsModule.default);
        console.log('fsModule.readFile:', fsModule.readFile);
    } catch (e) {
        console.error(e);
    }
})();
