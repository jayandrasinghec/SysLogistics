import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'searchfilter',
    pure: false
})
export class SearchFilterPipe implements PipeTransform {
    transform(items: any[], filter: string, isSearchable: boolean = true): any {
        if (!items || !filter ||  filter === '' || isSearchable) {
            return items;
        }
        //return items.filter(item => item.category_description.toLowerCase().indexOf(filter.toLowerCase()) !== -1);
        return items.filter(item => item.category_description.toLowerCase().startsWith(filter.toLowerCase()));
    }
}
