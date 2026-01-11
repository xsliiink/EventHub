describe('My first test',()=>{
    it('should sum nums correctly', ()=>{
        const sum = (a:number,b:number) => a + b;
        expect(sum(2,2)).toBe(4);
    });
});