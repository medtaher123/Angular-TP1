import { AbstractControl, ValidatorFn, ValidationErrors } from "@angular/forms";

export function cinAgeCorrelationValidtor(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
        const age = form.get('age')?.value;
        const cin = form.get('cin')?.value?.trim();


        if(!age || !cin || cin.length !== 8 || !/^\d{8}$/.test(cin)){
            return null;
        }

        const firstTwoDigits = parseInt(cin.substring(0,2), 10);
        if (age >= 60){
            if(firstTwoDigits >=20){
                return {cinAgeMismatch: true}
            }
        }else{
            if(firstTwoDigits<= 19){
                return {cinAgeMismatch: true}
            }
        }
        return null;
    }
}