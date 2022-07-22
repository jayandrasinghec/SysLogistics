import {Pipe, PipeTransform} from '@angular/core';
@Pipe ({
   name : 'Time'
})
export class TimePipe implements PipeTransform {
   transform(val: string, args: string ): string {
    if (args === undefined) {
      return val;
    }
    if (val === undefined) {
      return '';
    }
    const formattedText = (val.indexOf(args) === -1 ) ? args + '  ' + val : val;
    return  formattedText;
   }
}