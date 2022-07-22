import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'ntsListfilter',
    pure: false
})
export class NTSlistFilterPipe implements PipeTransform {
    transform(items: any[]): any {
        if (!items ) {
            return items;
        }
        const itemsArr =  items.filter((item) => {
              if (item.statusCode === undefined) {
                return item;
              } else if (item && item.statusCode  && item.statusCode !== 'D') {
                return item;
              }
        }   );
       // console.log('NTSlistFilterPipeitemsArr  ', itemsArr);
        return itemsArr;
    }
}
